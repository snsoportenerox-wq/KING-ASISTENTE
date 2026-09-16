require("dotenv").config();

const {
  Client,
  GatewayIntentBits,
  Partials,
  EmbedBuilder,
  REST,
  Routes,
  ChannelType,
  PermissionFlagsBits
} = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildInvites
  ],
  partials: [
    Partials.Channel,
    Partials.Message,
    Partials.GuildMember,
    Partials.User
  ]
});

/* =========================================================
   CONFIGURACIÓN
========================================================= */

const CONFIG = {
  guildId: process.env.GUILD_ID,

  channels: {
    rules: "1538681129333170279",
    economy: "1538681130776010752",
    alliesAffiliates: "1538681131543695401",
    ally: "1538681131019534454",
    affy: "1541542665940639795",
    welcome: "1538681130293923894",
    leave: "1538681130293923893",
    invites: "1538681130776010754",
    staffGuide: "1538681129333170278",
    staffRules: "1538681139333170283",
    appeals: "1538681130776010761",
    serverInfo: "1538681130293923890"
  },

  ally: {
    roleId: "1538681127861227635",
    minimumMembers: 50,
    image: "ALLY_IMAGE_URL"
  },

  affy: {
    minimumMembers: 100,
    image: "AFFY_IMAGE_URL"
  },

  appealInvite: "https://discord.gg/HXKYDk6RGD",

  afkDefaultReason: "Sin motivo especificado"
};

/* =========================================================
   MEMORIA TEMPORAL
========================================================= */

const afkUsers = new Map();
const inviteUses = new Map();
const processedInvites = new Set();

/* =========================================================
   UTILIDADES
========================================================= */

function createEmbed(title, description, options = {}) {
  const embed = new EmbedBuilder()
    .setTitle(title)
    .setDescription(description)
    .setTimestamp();

  if (options.color) embed.setColor(options.color);
  if (options.image) embed.setImage(options.image);
  if (options.thumbnail) embed.setThumbnail(options.thumbnail);
  if (options.footer) embed.setFooter({ text: options.footer });

  return embed;
}

async function getTextChannel(guild, channelId) {
  try {
    const channel = await guild.channels.fetch(channelId);

    if (!channel) {
      console.log(`❌ Canal no encontrado: ${channelId}`);
      return null;
    }

    if (!channel.isTextBased()) {
      console.log(`❌ El canal ${channelId} no es de texto.`);
      return null;
    }

    return channel;
  } catch (error) {
    console.error(`❌ Error obteniendo canal ${channelId}:`, error.message);
    return null;
  }
}

async function sendToChannel(guild, channelId, payload) {
  const channel = await getTextChannel(guild, channelId);

  if (!channel) return null;

  try {
    return await channel.send(payload);
  } catch (error) {
    console.error(
      `❌ No se pudo enviar al canal ${channelId}:`,
      error.message
    );
    return null;
  }
}

/* =========================================================
   LOGS
========================================================= */

async function getOrCreateLogsChannel(guild) {
  let logs = guild.channels.cache.find(
    c => c.name === "📋・logs"
  );

  if (logs) return logs;

  try {
    logs = await guild.channels.create({
      name: "📋・logs",
      type: ChannelType.GuildText,
      reason: "Canal de logs de King's Assistant"
    });

    console.log("✅ Canal 📋・logs creado.");

    return logs;
  } catch (error) {
    console.error("❌ No se pudo crear el canal de logs:", error);
    return null;
  }
}

async function logAction(guild, title, description) {
  const logs = await getOrCreateLogsChannel(guild);

  if (!logs) return;

  const embed = new EmbedBuilder()
    .setTitle(title)
    .setDescription(description)
    .setTimestamp();

  try {
    await logs.send({ embeds: [embed] });
  } catch (error) {
    console.error("❌ Error enviando log:", error.message);
  }
}

/* =========================================================
   ALLEYS / AFFYS
========================================================= */

function isDiscordInvite(text) {
  return /(?:https?:\/\/)?(?:www\.)?(?:discord\.gg|discord\.com\/invite)\/[A-Za-z0-9-]+/i.test(
    text
  );
}

function getInviteCode(text) {
  const match = text.match(
    /(?:https?:\/\/)?(?:www\.)?(?:discord\.gg|discord\.com\/invite)\/([A-Za-z0-9-]+)/i
  );

  return match ? match[1] : null;
}

function isOwnServerInvite(invite) {
  if (!invite) return false;

  if (invite.guild?.id === CONFIG.guildId) {
    return true;
  }

  return false;
}

async function processAllianceInvite(message) {
  if (!message.guild) return;
  if (message.author.bot) return;

  if (!isDiscordInvite(message.content)) return;

  const code = getInviteCode(message.content);

  if (!code) return;

  try {
    const invite = await client.fetchInvite(code, {
      withCounts: true
    });

    if (!invite.guild) return;

    // Ignorar nuestro propio servidor
    if (isOwnServerInvite(invite)) {
      return;
    }

    const targetGuild = invite.guild;

    const memberCount =
      invite.memberCount ||
      invite.approximateMemberCount ||
      0;

    /*
      Si el servidor tiene 100 o más miembros,
      se considera candidato para Affy.

      Si tiene entre 50 y 99,
      se considera candidato para Ally.
    */

    let type = null;

    if (memberCount >= CONFIG.affy.minimumMembers) {
      type = "affy";
    } else if (memberCount >= CONFIG.ally.minimumMembers) {
      type = "ally";
    }

    if (!type) {
      return;
    }

    /*
      Evita procesar exactamente la misma invitación
      múltiples veces durante el mismo proceso.
    */

    const processKey =
      `${type}:${targetGuild.id}:${message.id}`;

    if (processedInvites.has(processKey)) {
      return;
    }

    processedInvites.add(processKey);

    const channelId =
      type === "ally"
        ? CONFIG.channels.ally
        : CONFIG.channels.affy;

    const image =
      type === "ally"
        ? CONFIG.ally.image
        : CONFIG.affy.image;

    const channel = await getTextChannel(
      message.guild,
      channelId
    );

    if (!channel) return;

    const guildName = targetGuild.name;

    const formattedMembers =
      memberCount >= 1000
        ? `${(memberCount / 1000).toFixed(1)}K`
        : memberCount.toString();

    const typeText =
      type === "ally"
        ? "Nueva alianza"
        : "Nuevo affy";

    const embed = new EmbedBuilder()
      .setDescription(
        `◇　　**${typeText}:** ${guildName} 💞${formattedMembers}\n` +
        `　　　　　　　　　　🌸\n` +
        `__Puntuaje:__ 28 - __Ranking:__ 1st\n` +
        `　　　৲`
      )
      .setTimestamp();

    if (
      image &&
      image !== "ALLY_IMAGE_URL" &&
      image !== "AFFY_IMAGE_URL"
    ) {
      embed.setImage(image);
    }

    /*
      El ping SIEMPRE queda fuera del embed.
    */

    if (type === "ally") {
      await channel.send({
        content: `<@&${CONFIG.ally.roleId}>`,
        embeds: [embed],
        allowedMentions: {
          roles: [CONFIG.ally.roleId]
        }
      });

      await logAction(
        message.guild,
        "🤝 Nueva Ally detectada",
        `**Servidor:** ${guildName}\n` +
        `**Miembros:** ${memberCount}\n` +
        `**Enviada por:** ${message.author}`
      );

      console.log(
        `🤝 Ally publicada: ${guildName} (${memberCount})`
      );
    }

    if (type === "affy") {
      await channel.send({
        content: "@everyone",
        embeds: [embed],
        allowedMentions: {
          parse: ["everyone"]
        }
      });

      await logAction(
        message.guild,
        "💞 Nuevo Affy detectado",
        `**Servidor:** ${guildName}\n` +
        `**Miembros:** ${memberCount}\n` +
        `**Enviada por:** ${message.author}`
      );

      console.log(
        `💞 Affy publicado: ${guildName} (${memberCount})`
      );
    }

  } catch (error) {
    console.error(
      "❌ Error procesando invitación de Ally/Affy:",
      error.message
    );
  }
}

/* =========================================================
   AFK
========================================================= */

function formatDuration(ms) {
  const seconds = Math.floor(ms / 1000);

  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days} día(s)`;
  if (hours > 0) return `${hours} hora(s)`;
  if (minutes > 0) return `${minutes} minuto(s)`;

  return `${seconds} segundo(s)`;
}

/* =========================================================
   COMANDOS
========================================================= */

const commands = [
  {
    name: "8ball",
    description: "Hazle una pregunta a la bola 8.",
    options: [
      {
        name: "pregunta",
        description: "Tu pregunta.",
        type: 3,
        required: true
      }
    ]
  },

  {
    name: "coinflip",
    description: "Lanza una moneda."
  },

  {
    name: "dice",
    description: "Lanza un dado."
  },

  {
    name: "rps",
    description: "Juega piedra, papel o tijera.",
    options: [
      {
        name: "eleccion",
        description: "Tu elección.",
        type: 3,
        required: true,
        choices: [
          { name: "Piedra", value: "piedra" },
          { name: "Papel", value: "papel" },
          { name: "Tijera", value: "tijera" }
        ]
      }
    ]
  },

  {
    name: "choose",
    description: "Elige entre varias opciones.",
    options: [
      {
        name: "opciones",
        description: "Opciones separadas por comas.",
        type: 3,
        required: true
      }
    ]
  },

  {
    name: "random",
    description: "Genera un número aleatorio."
  },

  {
    name: "wyr",
    description: "Would You Rather."
  },

  {
    name: "joke",
    description: "Cuenta un chiste."
  },

  {
    name: "compliment",
    description: "Da un cumplido."
  },

  {
    name: "fortune",
    description: "Consulta tu fortuna."
  },

  {
    name: "help",
    description: "Muestra los comandos."
  },

  {
    name: "serverinfo",
    description: "Muestra información del servidor."
  },

  {
    name: "userinfo",
    description: "Muestra información de un usuario.",
    options: [
      {
        name: "usuario",
        description: "Usuario.",
        type: 6,
        required: false
      }
    ]
  },

  {
    name: "roleinfo",
    description: "Muestra información de un rol.",
    options: [
      {
        name: "rol",
        description: "Rol.",
        type: 8,
        required: true
      }
    ]
  },

  {
    name: "channelinfo",
    description: "Muestra información del canal."
  },

  {
    name: "avatar",
    description: "Muestra el avatar de un usuario.",
    options: [
      {
        name: "usuario",
        description: "Usuario.",
        type: 6,
        required: false
      }
    ]
  },

  {
    name: "membercount",
    description: "Muestra el número de miembros."
  },

  {
    name: "boosters",
    description: "Muestra los boosters."
  },

  {
    name: "staff",
    description: "Muestra información del staff."
  },

  {
    name: "rules",
    description: "Muestra las reglas."
  },

  {
    name: "links",
    description: "Muestra enlaces importantes."
  },

  {
    name: "servericon",
    description: "Muestra el icono del servidor."
  },

  {
    name: "serverbanner",
    description: "Muestra el banner del servidor."
  },

  {
    name: "joined",
    description: "Muestra cuándo entró un usuario.",
    options: [
      {
        name: "usuario",
        description: "Usuario.",
        type: 6,
        required: false
      }
    ]
  },

  {
    name: "roles",
    description: "Muestra los roles del servidor."
  },

  {
    name: "afk",
    description: "Activa tu estado AFK.",
    options: [
      {
        name: "motivo",
        description: "Motivo del AFK.",
        type: 3,
        required: false
      }
    ]
  },

  {
    name: "ping",
    description: "Muestra el ping del bot."
  },

  {
    name: "uptime",
    description: "Muestra el tiempo activo."
  },

  {
    name: "botinfo",
    description: "Muestra información del bot."
  },

  {
    name: "status",
    description: "Muestra el estado del bot."
  },

  {
    name: "stats",
    description: "Muestra estadísticas del bot."
  },

  {
    name: "changelog",
    description: "Muestra las últimas actualizaciones."
  },

  {
    name: "calculate",
    description: "Calcula una operación.",
    options: [
      {
        name: "operacion",
        description: "Operación matemática.",
        type: 3,
        required: true
      }
    ]
  },

  {
    name: "timestamp",
    description: "Genera un timestamp.",
    options: [
      {
        name: "fecha",
        description: "Fecha opcional.",
        type: 3,
        required: false
      }
    ]
  }
];

/* =========================================================
   REGISTRAR COMANDOS
========================================================= */

async function registerCommands() {
  try {
    const guild = await client.guilds.fetch(CONFIG.guildId);

    if (!guild) {
      console.log("❌ No se encontró el servidor.");
      return;
    }

    await guild.commands.set(commands);

    console.log(
      `✅ ${commands.length} comandos registrados en ${guild.name}.`
    );

  } catch (error) {
    console.error(
      "❌ Error registrando comandos:",
      error
    );
  }
}

/* =========================================================
   SERVER INFO
========================================================= */

function buildServerInfo(guild) {
  const members = guild.members.cache;

  const bots = members.filter(
    member => member.user.bot
  ).size;

  const users = guild.memberCount - bots;

  const online = members.filter(
    member =>
      member.presence &&
      member.presence.status !== "offline"
  ).size;

  const boosters = members.filter(
    member => member.premiumSince
  ).size;

  const channels = guild.channels.cache;

  const textChannels = channels.filter(
    channel =>
      channel.type === ChannelType.GuildText
  ).size;

  const voiceChannels = channels.filter(
    channel =>
      channel.type === ChannelType.GuildVoice
  ).size;

  const categories = channels.filter(
    channel =>
      channel.type === ChannelType.GuildCategory
  ).size;

  const nextBoostLevel =
    guild.premiumTier < 3
      ? guild.premiumTier + 1
      : "Máximo";

  return {
    members,
    bots,
    users,
    online,
    boosters,
    channels,
    textChannels,
    voiceChannels,
    categories,
    roles: guild.roles.cache.size,
    emojis: guild.emojis.cache.size,
    stickers: guild.stickers.cache.size,
    boostLevel: guild.premiumTier,
    boosts: guild.premiumSubscriptionCount || 0,
    nextBoostLevel
  };
}

/* =========================================================
   GUÍAS
========================================================= */

async function publishGuide(
  guild,
  channelId,
  embed,
  marker
) {
  const channel = await getTextChannel(guild, channelId);

  if (!channel) return;

  try {
    const messages = await channel.messages.fetch({
      limit: 100
    });

    const exists = messages.some(message =>
      message.author.id === client.user.id &&
      message.embeds.some(
        e => e.footer?.text === marker
      )
    );

    if (exists) {
      console.log(`ℹ️ Guía ya existente: ${marker}`);
      return;
    }

    embed.setFooter({
      text: marker
    });

    await channel.send({
      embeds: [embed]
    });

    console.log(`✅ Guía enviada: ${marker}`);

  } catch (error) {
    console.error(
      `❌ Error enviando guía ${marker}:`,
      error.message
    );
  }
}

async function publishAllGuides(guild) {
  /*
    Estas son las estructuras de los sistemas.
    Aquí se mantienen separadas para poder colocar
    exactamente los textos/fotos originales.
  */

  await publishGuide(
    guild,
    CONFIG.channels.rules,
    createEmbed(
      "📜 REGLAS / KING THE LAND",
      "Bienvenido a la normativa oficial de ♛ King the Land ♛.",
      {
        footer: "KING_ASSISTANT_RULES"
      }
    ),
    "KING_ASSISTANT_RULES"
  );

  await publishGuide(
    guild,
    CONFIG.channels.economy,
    createEmbed(
      "💰 ECONOMÍA / KING THE LAND",
      "Información oficial del sistema de economía.",
      {
        footer: "KING_ASSISTANT_ECONOMY"
      }
    ),
    "KING_ASSISTANT_ECONOMY"
  );

  await publishGuide(
    guild,
    CONFIG.channels.alliesAffiliates,
    createEmbed(
      "🤝 ALLIES & AFFILIATES",
      "Información y requisitos para Allies y Affiliates.",
      {
        footer: "KING_ASSISTANT_ALLIES"
      }
    ),
    "KING_ASSISTANT_ALLIES"
  );

  await publishGuide(
    guild,
    CONFIG.channels.staffGuide,
    createEmbed(
      "🛡️ STAFF GUIDE",
      "Información sobre los rangos y responsabilidades del Staff.",
      {
        footer: "KING_ASSISTANT_STAFF_GUIDE"
      }
    ),
    "KING_ASSISTANT_STAFF_GUIDE"
  );

  await publishGuide(
    guild,
    CONFIG.channels.staffRules,
    createEmbed(
      "📜 STAFF RULES",
      "Normas oficiales para el equipo Staff.",
      {
        footer: "KING_ASSISTANT_STAFF_RULES"
      }
    ),
    "KING_ASSISTANT_STAFF_RULES"
  );

  await publishGuide(
    guild,
    CONFIG.channels.appeals,
    createEmbed(
      "⚖️ SANCIONES Y APELACIONES",
      `Si consideras que una sanción debe ser revisada, puedes presentar tu apelación en nuestro servidor de apelaciones.\n\n${CONFIG.appealInvite}`,
      {
        footer: "KING_ASSISTANT_APPEALS"
      }
    ),
    "KING_ASSISTANT_APPEALS"
  );

  /*
    Información del servidor.
    Discord permite máximo 10 embeds por mensaje,
    por eso después podremos colocar los 15
    exactamente como los diseñamos.
  */

  const info = buildServerInfo(guild);

  const infoEmbeds = [
    createEmbed(
      "🏨 INFORMACIÓN DEL SERVIDOR",
      `**${guild.name}**\nID: \`${guild.id}\``,
      { footer: "KING_ASSISTANT_SERVERINFO_1" }
    ),

    createEmbed(
      "🏨 SOBRE EL SERVIDOR",
      `Servidor creado: <t:${Math.floor(
        guild.createdTimestamp / 1000
      )}:F>`
    ),

    createEmbed(
      "📜 NORMATIVA",
      "Consulta el canal de reglas para conocer la normativa oficial."
    ),

    createEmbed(
      "🛎️ BIENVENIDA",
      "Bienvenido a ♛ King the Land ♛."
    ),

    createEmbed(
      "🌸 COMUNIDAD",
      "Nuestra comunidad busca mantener un ambiente agradable y respetuoso."
    ),

    createEmbed(
      "🎉 EVENTOS",
      "Aquí podrás encontrar información sobre los eventos del servidor."
    ),

    createEmbed(
      "✨ BENEFICIOS",
      "Consulta los beneficios disponibles dentro del servidor."
    ),

    createEmbed(
      "🎟️ INVITACIONES",
      "Las invitaciones forman parte del sistema de crecimiento de la comunidad."
    ),

    createEmbed(
      "🛡️ STAFF",
      "Nuestro equipo Staff ayuda a mantener y organizar el servidor."
    ),

    createEmbed(
      "⚖️ SANCIONES Y APELACIONES",
      `Las apelaciones pueden realizarse mediante nuestro servidor de apelaciones.\n${CONFIG.appealInvite}`
    ),

    createEmbed(
      "💤 AFK",
      "Puedes utilizar `/afk` para establecer un motivo AFK."
    ),

    createEmbed(
      "📢 ANUNCIOS",
      "Los anuncios importantes se publican en los canales correspondientes."
    ),

    createEmbed(
      "🔗 ENLACES IMPORTANTES",
      "Aquí se recopilan los enlaces oficiales de la comunidad."
    ),

    createEmbed(
      "🛡️ STAFF & CONTACTO",
      "Para recibir ayuda, contacta con el equipo correspondiente."
    ),

    createEmbed(
      "🚪 CHECK-OUT",
      "Gracias por formar parte de ♛ King the Land ♛."
    )
  ];

  /*
    Añadimos datos reales a la portada.
  */

  infoEmbeds[0].setDescription(
    `**${guild.name}**\n\n` +
    `🆔 ID: \`${guild.id}\`\n` +
    `👑 Owner: <@${guild.ownerId}>\n` +
    `📅 Creado: <t:${Math.floor(
      guild.createdTimestamp / 1000
    )}:F>\n\n` +
    `👥 Miembros: **${guild.memberCount}**\n` +
    `👤 Usuarios: **${info.users}**\n` +
    `🤖 Bots: **${info.bots}**\n` +
    `🟢 Online: **${info.online}**\n` +
    `🚀 Boosters: **${info.boosters}**`
  );

  infoEmbeds[1].setDescription(
    `**Nombre:** ${guild.name}\n` +
    `**ID:** \`${guild.id}\`\n` +
    `**Owner:** <@${guild.ownerId}>\n` +
    `**Creación:** <t:${Math.floor(
      guild.createdTimestamp / 1000
    )}:F>`
  );

  infoEmbeds[2].setDescription(
    "Consulta las reglas oficiales del servidor."
  );

  infoEmbeds[6].setDescription(
    `🚀 Nivel de boost: **${info.boostLevel}**\n` +
    `💎 Boosts: **${info.boosts}**`
  );

  infoEmbeds[7].setDescription(
    `🎟️ Sistema de invitaciones activo.\n\n` +
    `Los enlaces válidos pueden ser procesados automáticamente por King's Assistant.`
  );

  infoEmbeds[10].setDescription(
    "Usa `/afk [motivo]` para activar AFK."
  );

  infoEmbeds[13].setDescription(
    "El equipo Staff está disponible para ayudar con dudas y situaciones del servidor."
  );

  for (let i = 0; i < infoEmbeds.length; i++) {
    infoEmbeds[i].setFooter({
      text: `KING_ASSISTANT_SERVERINFO_${i + 1}`
    });
  }

  const channel = await getTextChannel(
    guild,
    CONFIG.channels.serverInfo
  );

  if (channel) {
    try {
      const messages = await channel.messages.fetch({
        limit: 100
      });

      const firstExists = messages.some(message =>
        message.author.id === client.user.id &&
        message.embeds.some(
          e =>
            e.footer?.text ===
            "KING_ASSISTANT_SERVERINFO_1"
        )
      );

      if (!firstExists) {
        await channel.send({
          embeds: infoEmbeds.slice(0, 10)
        });

        await channel.send({
          embeds: infoEmbeds.slice(10, 15)
        });

        console.log(
          "✅ Los 15 embeds de información fueron enviados."
        );
      } else {
        console.log(
          "ℹ️ Los embeds de información ya existen."
        );
      }

    } catch (error) {
      console.error(
        "❌ Error enviando información del servidor:",
        error.message
      );
    }
  }
}

/* =========================================================
   EVENTO READY
========================================================= */

client.once("clientReady", async () => {
  console.log("=================================");
  console.log("♛ KING'S ASSISTANT ♛");
  console.log(`✅ Conectado como ${client.user.tag}`);
  console.log(`🏨 Servidores: ${client.guilds.cache.size}`);
  console.log("=================================");

  const guild = client.guilds.cache.get(
    CONFIG.guildId
  );

  if (!guild) {
    console.log(
      "❌ El bot no está en el servidor configurado."
    );
    return;
  }

  await getOrCreateLogsChannel(guild);

  await logAction(
    guild,
    "🤖 Bot iniciado",
    `King's Assistant se ha conectado correctamente.`
  );

  await registerCommands();

  /*
    Publicar guías solamente si no existen.
  */

  await publishAllGuides(guild);
});

/* =========================================================
   WELCOME
========================================================= */

client.on("guildMemberAdd", async member => {
  if (member.guild.id !== CONFIG.guildId) return;

  const channel = await getTextChannel(
    member.guild,
    CONFIG.channels.welcome
  );

  if (!channel) return;

  const embed = new EmbedBuilder()
    .setTitle("🛎️ ¡Bienvenido a ♛ King the Land ♛!")
    .setDescription(
      `Nos alegra tenerte aquí, ${member}.\n\n` +
      `Disfruta de tu estancia y recuerda leer las reglas.`
    )
    .setThumbnail(member.user.displayAvatarURL())
    .setTimestamp();

  await channel.send({
    content: `${member}`,
    embeds: [embed]
  });

  await logAction(
    member.guild,
    "🛎️ Nuevo miembro",
    `${member} se ha unido al servidor.`
  );
});

/* =========================================================
   LEAVE
========================================================= */

client.on("guildMemberRemove", async member => {
  if (member.guild.id !== CONFIG.guildId) return;

  const channel = await getTextChannel(
    member.guild,
    CONFIG.channels.leave
  );

  if (!channel) return;

  const embed = new EmbedBuilder()
    .setTitle("🚪 Check-out")
    .setDescription(
      `Gracias por haber formado parte de ♛ King the Land ♛.`
    )
    .setThumbnail(member.user.displayAvatarURL())
    .setTimestamp();

  await channel.send({
    content: `${member}`,
    embeds: [embed]
  });

  await logAction(
    member.guild,
    "🚪 Miembro salió",
    `${member.user.tag} abandonó el servidor.`
  );
});

/* =========================================================
   INVITACIONES
========================================================= */

client.on("inviteCreate", async invite => {
  if (!invite.guild) return;
  if (invite.guild.id !== CONFIG.guildId) return;

  inviteUses.set(
    invite.code,
    invite.uses || 0
  );

  await logAction(
    invite.guild,
    "🎟️ Invitación creada",
    `Código: \`${invite.code}\``
  );
});

client.on("inviteDelete", async invite => {
  if (!invite.guild) return;
  if (invite.guild.id !== CONFIG.guildId) return;

  inviteUses.delete(invite.code);

  await logAction(
    invite.guild,
    "🗑️ Invitación eliminada",
    `Código: \`${invite.code}\``
  );
});

/* =========================================================
   MENSAJES
========================================================= */

client.on("messageCreate", async message => {
  if (!message.guild) return;

  /*
    Primero comprobamos Allys/Affys.
  */

  await processAllianceInvite(message);

  /*
    AFK
  */

  if (message.author.bot) return;

  /*
    Si alguien menciona a un usuario AFK.
  */

  for (const mentionedUser of message.mentions.users.values()) {
    const afk = afkUsers.get(mentionedUser.id);

    if (!afk) continue;

    const duration = formatDuration(
      Date.now() - afk.timestamp
    );

    await message.reply(
      `💤 **${mentionedUser.username} está AFK.**\n` +
      `Motivo: **${afk.reason}**\n` +
      `Tiempo: **${duration}**`
    );
  }

  /*
    Si el usuario estaba AFK y escribe,
    se elimina el estado AFK.
  */

  if (afkUsers.has(message.author.id)) {
    const afk = afkUsers.get(message.author.id);

    afkUsers.delete(message.author.id);

    try {
      await message.member.setNickname(
        afk.oldNickname,
        "Usuario regresó de AFK"
      );
    } catch {}

    await message.reply(
      `👋 Bienvenido de vuelta, ${message.author}. ` +
      `Tu estado AFK ha sido eliminado.`
    );
  }
});

/* =========================================================
   INTERACCIONES
========================================================= */

client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const command = interaction.commandName;

  try {

    /* ================= FUN ================= */

    if (command === "8ball") {
      const answers = [
        "Sí.",
        "No.",
        "Tal vez.",
        "Definitivamente.",
        "No parece probable.",
        "Las estrellas dicen que sí."
      ];

      const question =
        interaction.options.getString("pregunta");

      const answer =
        answers[Math.floor(Math.random() * answers.length)];

      return interaction.reply(
        `🎱 **Pregunta:** ${question}\n**Respuesta:** ${answer}`
      );
    }

    if (command === "coinflip") {
      return interaction.reply(
        Math.random() < 0.5
          ? "🪙 **Cara**"
          : "🪙 **Cruz**"
      );
    }

    if (command === "dice") {
      return interaction.reply(
        `🎲 Salió: **${Math.floor(
          Math.random() * 6
        ) + 1}**`
      );
    }

    if (command === "rps") {
      const userChoice =
        interaction.options.getString("eleccion");

      const choices = [
        "piedra",
        "papel",
        "tijera"
      ];

      const botChoice =
        choices[Math.floor(Math.random() * 3)];

      let result = "Empate.";

      if (
        (userChoice === "piedra" && botChoice === "tijera") ||
        (userChoice === "papel" && botChoice === "piedra") ||
        (userChoice === "tijera" && botChoice === "papel")
      ) {
        result = "¡Ganaste! 🎉";
      } else if (userChoice !== botChoice) {
        result = "Ganó el bot. 🤖";
      }

      return interaction.reply(
        `🪨📄✂️ Tú: **${userChoice}**\n` +
        `🤖 Bot: **${botChoice}**\n\n` +
        `**${result}**`
      );
    }

    if (command === "choose") {
      const text =
        interaction.options.getString("opciones");

      const options = text
        .split(",")
        .map(x => x.trim())
        .filter(Boolean);

      if (!options.length) {
        return interaction.reply(
          "❌ Debes proporcionar opciones."
        );
      }

      const selected =
        options[Math.floor(Math.random() * options.length)];

      return interaction.reply(
        `🎯 Elegí: **${selected}**`
      );
    }

    if (command === "random") {
      return interaction.reply(
        `🎲 Número aleatorio: **${Math.floor(
          Math.random() * 100
        ) + 1}**`
      );
    }

    if (command === "wyr") {
      const questions = [
        "¿Preferirías viajar al pasado o al futuro?",
        "¿Preferirías tener suerte o inteligencia?",
        "¿Preferirías vivir en una mansión o viajar por el mundo?"
      ];

      return interaction.reply(
        `🤔 **¿Qué prefieres?**\n\n${
          questions[
            Math.floor(Math.random() * questions.length)
          ]
        }`
      );
    }

    if (command === "joke") {
      return interaction.reply(
        "😂 ¿Qué hace una abeja en el gimnasio? ¡Zum-ba!"
      );
    }

    if (command === "compliment") {
      return interaction.reply(
        "✨ Tienes una energía increíble."
      );
    }

    if (command === "fortune") {
      return interaction.reply(
        "🔮 Algo interesante podría aparecer cuando menos lo esperes."
      );
    }

    /* ================= INFORMATION ================= */

    if (command === "help") {
      return interaction.reply({
        embeds: [
          createEmbed(
            "♛ King's Assistant — Ayuda",
            "**🎉 Diversión**\n" +
            "`/8ball` `/coinflip` `/dice` `/rps` `/choose` `/random` `/wyr` `/joke` `/compliment` `/fortune`\n\n" +
            "**📋 Información**\n" +
            "`/serverinfo` `/userinfo` `/roleinfo` `/channelinfo` `/avatar` `/membercount` `/boosters` `/staff` `/rules` `/links` `/servericon` `/serverbanner` `/joined` `/roles`\n\n" +
            "**🛠️ Utilidad**\n" +
            "`/afk` `/ping` `/uptime` `/botinfo` `/status` `/stats` `/changelog` `/calculate` `/timestamp`"
          )
        ]
      });
    }

    if (command === "serverinfo") {
      const info = buildServerInfo(
        interaction.guild
      );

      return interaction.reply({
        embeds: [
          createEmbed(
            "🏨 Información del servidor",
            `**${interaction.guild.name}**\n\n` +
            `👥 Miembros: **${interaction.guild.memberCount}**\n` +
            `👤 Usuarios: **${info.users}**\n` +
            `🤖 Bots: **${info.bots}**\n` +
            `🟢 Online: **${info.online}**\n` +
            `🚀 Boosters: **${info.boosters}**\n\n` +
            `📚 Canales: **${info.channels.size}**\n` +
            `💬 Texto: **${info.textChannels}**\n` +
            `🔊 Voz: **${info.voiceChannels}**\n` +
            `📁 Categorías: **${info.categories}**\n` +
            `🎭 Roles: **${info.roles}**\n` +
            `😀 Emojis: **${info.emojis}**\n` +
            `🏷️ Stickers: **${info.stickers}**\n\n` +
            `🚀 Boost: **Nivel ${info.boostLevel}**\n` +
            `💎 Boosts: **${info.boosts}**`
          )
        ]
      });
    }

    if (command === "userinfo") {
      const user =
        interaction.options.getUser("usuario") ||
        interaction.user;

      return interaction.reply({
        embeds: [
          createEmbed(
            `👤 ${user.username}`,
            `ID: \`${user.id}\`\n` +
            `Bot: **${user.bot ? "Sí" : "No"}**\n` +
            `Creado: <t:${Math.floor(
              user.createdTimestamp / 1000
            )}:F>`,
            {
              thumbnail: user.displayAvatarURL()
            }
          )
        ]
      });
    }

    if (command === "roleinfo") {
      const role =
        interaction.options.getRole("rol");

      return interaction.reply(
        `🎭 **${role.name}**\n` +
        `ID: \`${role.id}\`\n` +
        `Miembros: **${role.members.size}**`
      );
    }

    if (command === "channelinfo") {
      const channel = interaction.channel;

      return interaction.reply(
        `📋 **${channel.name}**\n` +
        `ID: \`${channel.id}\`\n` +
        `Tipo: **${channel.type}**`
      );
    }

    if (command === "avatar") {
      const user =
        interaction.options.getUser("usuario") ||
        interaction.user;

      return interaction.reply({
        content: user.displayAvatarURL({
          size: 1024,
          extension: "png"
        })
      });
    }

    if (command === "membercount") {
      return interaction.reply(
        `👥 Este servidor tiene **${interaction.guild.memberCount}** miembros.`
      );
    }

    if (command === "boosters") {
      const boosters =
        interaction.guild.members.cache.filter(
          member => member.premiumSince
        );

      return interaction.reply(
        `🚀 Boosters: **${boosters.size}**`
      );
    }

    if (command === "staff") {
      return interaction.reply(
        "🛡️ Consulta el canal de Staff Guide para conocer los rangos y funciones del equipo."
      );
    }

    if (command === "rules") {
      return interaction.reply(
        "📜 Consulta el canal de Rules para ver la normativa oficial."
      );
    }

    if (command === "links") {
      return interaction.reply(
        `🔗 **Enlaces importantes**\n\n` +
        `⚖️ Apelaciones: ${CONFIG.appealInvite}`
      );
    }

    if (command === "servericon") {
      const icon =
        interaction.guild.iconURL({
          size: 1024
        });

      return interaction.reply(
        icon || "❌ El servidor no tiene icono."
      );
    }

    if (command === "serverbanner") {
      const banner =
        interaction.guild.bannerURL({
          size: 1024
        });

      return interaction.reply(
        banner || "❌ El servidor no tiene banner."
      );
    }

    if (command === "joined") {
      const user =
        interaction.options.getUser("usuario") ||
        interaction.user;

      const member =
        await interaction.guild.members.fetch(
          user.id
        );

      if (!member.joinedTimestamp) {
        return interaction.reply(
          "❌ No se pudo obtener la fecha."
        );
      }

      return interaction.reply(
        `📅 ${user} entró al servidor <t:${Math.floor(
          member.joinedTimestamp / 1000
        )}:F>`
      );
    }

    if (command === "roles") {
      const roles =
        interaction.guild.roles.cache
          .filter(role => role.id !== interaction.guild.id)
          .map(role => `<@&${role.id}>`)
          .slice(0, 50)
          .join(" ");

      return interaction.reply(
        roles || "No hay roles."
      );
    }

    /* ================= UTILITY ================= */

    if (command === "afk") {
      const reason =
        interaction.options.getString("motivo") ||
        CONFIG.afkDefaultReason;

      const member =
        interaction.member;

      const oldNickname =
        member.nickname || member.user.username;

      afkUsers.set(
        interaction.user.id,
        {
          reason,
          timestamp: Date.now(),
          oldNickname
        }
      );

      try {
        await member.setNickname(
          `[AFK] ${oldNickname}`.slice(0, 32),
          "Usuario activó AFK"
        );
      } catch {}

      return interaction.reply(
        `💤 Has activado AFK.\nMotivo: **${reason}**`
      );
    }

    if (command === "ping") {
      return interaction.reply(
        `🏓 Pong! **${client.ws.ping}ms**`
      );
    }

    if (command === "uptime") {
      return interaction.reply(
        `⏱️ Uptime: **${formatDuration(
          client.uptime
        )}**`
      );
    }

    if (command === "botinfo") {
      return interaction.reply({
        embeds: [
          createEmbed(
            "♛ King's Assistant",
            `🤖 Bot privado de **♛ King the Land ♛**\n\n` +
            `🏨 Servidores: **${client.guilds.cache.size}**\n` +
            `📡 Ping: **${client.ws.ping}ms**\n` +
            `⏱️ Uptime: **${formatDuration(client.uptime)}**`
          )
        ]
      });
    }

    if (command === "status") {
      return interaction.reply(
        `🟢 **Online**\n🏓 Ping: **${client.ws.ping}ms**`
      );
    }

    if (command === "stats") {
      return interaction.reply(
        `📊 **Estadísticas**\n` +
        `🏨 Servidores: **${client.guilds.cache.size}**\n` +
        `👥 Usuarios aproximados: **${client.guilds.cache.reduce(
          (a, g) => a + g.memberCount,
          0
        )}**\n` +
        `⚙️ Comandos: **${commands.length}**`
      );
    }

    if (command === "changelog") {
      return interaction.reply(
        "📋 **King's Assistant**\n\nSistema de Allys/Affys añadido junto con mejoras generales."
      );
    }

    if (command === "calculate") {
      const operation =
        interaction.options.getString("operacion");

      /*
        Solo permitimos caracteres matemáticos básicos.
      */

      if (!/^[0-9+\-*/().%\s]+$/.test(operation)) {
        return interaction.reply(
          "❌ Operación no válida."
        );
      }

      try {
        const result = Function(
          `"use strict"; return (${operation})`
        )();

        return interaction.reply(
          `🧮 **Resultado:** \`${result}\``
        );
      } catch {
        return interaction.reply(
          "❌ No pude calcular esa operación."
        );
      }
    }

    if (command === "timestamp") {
      const dateText =
        interaction.options.getString("fecha");

      const timestamp = dateText
        ? Math.floor(
            new Date(dateText).getTime() / 1000
          )
        : Math.floor(Date.now() / 1000);

      if (Number.isNaN(timestamp)) {
        return interaction.reply(
          "❌ Fecha no válida."
        );
      }

      return interaction.reply(
        `🕐 Timestamp:\n<t:${timestamp}:F>\n\n\`<t:${timestamp}:F>\``
      );
    }

  } catch (error) {
    console.error(
      `❌ Error ejecutando /${command}:`,
      error
    );

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(
        "❌ Ocurrió un error ejecutando el comando."
      );
    } else {
      await interaction.reply(
        "❌ Ocurrió un error ejecutando el comando."
      );
    }
  }
});

/* =========================================================
   ERRORES
========================================================= */

process.on("unhandledRejection", error => {
  console.error(
    "❌ Unhandled Rejection:",
    error
  );
});

process.on("uncaughtException", error => {
  console.error(
    "❌ Uncaught Exception:",
    error
  );
});

/* =========================================================
   INICIO
========================================================= */

if (!process.env.DISCORD_TOKEN) {
  console.error(
    "❌ Falta DISCORD_TOKEN en .env"
  );
  process.exit(1);
}

if (!process.env.GUILD_ID) {
  console.error(
    "❌ Falta GUILD_ID en .env"
  );
  process.exit(1);
}

client.login(process.env.DISCORD_TOKEN);
