require('dotenv').config();

const {
  Client,
  GatewayIntentBits,
  Partials,
  EmbedBuilder,
  ChannelType,
  SlashCommandBuilder,
  REST,
  Routes
} = require('discord.js');

// ═══════════════════════════════════════════════
// ♛ KING'S ASSISTANT ♛
// ═══════════════════════════════════════════════

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

// ═══════════════════════════════════════════════
// ⚙️ CONFIGURACIÓN
// ═══════════════════════════════════════════════

const CONFIG = {
  guildId: process.env.GUILD_ID,

  channels: {
    rules: '1538681129333170279',
    economy: '1538681130776010752',
    allies: '1538681131543695401',
    welcome: '1538681130293923894',
    leave: '1538681130293923893',
    invites: '1538681130776010754',
    staffGuide: '1538681129333170278',
    staffRules: '1538681129333170283',
    appeals: '1538681130776010761',
    serverInfo: '1538681130293923890'
  },

  appealServer: 'https://discord.gg/HXKYDk6RGD'
};

// ═══════════════════════════════════════════════
// 💾 DATOS TEMPORALES
// ═══════════════════════════════════════════════

const afkUsers = new Map();
const inviteUses = new Map();

// ═══════════════════════════════════════════════
// 🎨 EMBEDS
// ═══════════════════════════════════════════════

function createEmbed(title, description = '') {
  return new EmbedBuilder()
    .setColor(0xD4AF37)
    .setTitle(title)
    .setDescription(description)
    .setTimestamp();
}

async function sendToChannel(channelId, message) {
  const channel = client.channels.cache.get(channelId);

  if (!channel) {
    console.log(`⚠️ Canal no encontrado: ${channelId}`);
    return null;
  }

  try {
    return await channel.send(message);
  } catch (error) {
    console.error(`❌ Error enviando mensaje:`, error);
    return null;
  }
}

// ═══════════════════════════════════════════════
// 📋 COMANDOS
// ═══════════════════════════════════════════════

const commands = [

  // FUN
  new SlashCommandBuilder()
    .setName('8ball')
    .setDescription('Haz una pregunta a la bola mágica')
    .addStringOption(option =>
      option
        .setName('pregunta')
        .setDescription('Tu pregunta')
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName('coinflip')
    .setDescription('Lanza una moneda'),

  new SlashCommandBuilder()
    .setName('dice')
    .setDescription('Lanza un dado'),

  new SlashCommandBuilder()
    .setName('rps')
    .setDescription('Piedra, papel o tijera')
    .addStringOption(option =>
      option
        .setName('eleccion')
        .setDescription('Tu elección')
        .setRequired(true)
        .addChoices(
          { name: 'Piedra', value: 'piedra' },
          { name: 'Papel', value: 'papel' },
          { name: 'Tijera', value: 'tijera' }
        )
    ),

  new SlashCommandBuilder()
    .setName('choose')
    .setDescription('Elige una opción')
    .addStringOption(option =>
      option
        .setName('opciones')
        .setDescription('Opciones separadas por comas')
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName('random')
    .setDescription('Genera un número aleatorio')
    .addIntegerOption(option =>
      option
        .setName('maximo')
        .setDescription('Número máximo')
        .setRequired(true)
        .setMinValue(1)
    ),

  new SlashCommandBuilder()
    .setName('wyr')
    .setDescription('Pregunta qué prefieres'),

  new SlashCommandBuilder()
    .setName('joke')
    .setDescription('Cuenta un chiste'),

  new SlashCommandBuilder()
    .setName('compliment')
    .setDescription('Envía un cumplido'),

  new SlashCommandBuilder()
    .setName('fortune')
    .setDescription('Recibe una fortuna'),

  // INFORMACIÓN
  new SlashCommandBuilder()
    .setName('help')
    .setDescription('Muestra los comandos'),

  new SlashCommandBuilder()
    .setName('serverinfo')
    .setDescription('Muestra información del servidor'),

  new SlashCommandBuilder()
    .setName('userinfo')
    .setDescription('Muestra información de un usuario')
    .addUserOption(option =>
      option
        .setName('usuario')
        .setDescription('Usuario')
        .setRequired(false)
    ),

  new SlashCommandBuilder()
    .setName('roleinfo')
    .setDescription('Muestra información de un rol')
    .addRoleOption(option =>
      option
        .setName('rol')
        .setDescription('Rol')
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName('channelinfo')
    .setDescription('Muestra información de un canal')
    .addChannelOption(option =>
      option
        .setName('canal')
        .setDescription('Canal')
        .setRequired(false)
    ),

  new SlashCommandBuilder()
    .setName('avatar')
    .setDescription('Muestra un avatar')
    .addUserOption(option =>
      option
        .setName('usuario')
        .setDescription('Usuario')
        .setRequired(false)
    ),

  new SlashCommandBuilder()
    .setName('membercount')
    .setDescription('Muestra la cantidad de miembros'),

  new SlashCommandBuilder()
    .setName('boosters')
    .setDescription('Muestra los boosters'),

  new SlashCommandBuilder()
    .setName('staff')
    .setDescription('Información del Staff'),

  new SlashCommandBuilder()
    .setName('rules')
    .setDescription('Información de las reglas'),

  new SlashCommandBuilder()
    .setName('links')
    .setDescription('Muestra los enlaces importantes'),

  new SlashCommandBuilder()
    .setName('servericon')
    .setDescription('Muestra el icono del servidor'),

  new SlashCommandBuilder()
    .setName('serverbanner')
    .setDescription('Muestra el banner del servidor'),

  new SlashCommandBuilder()
    .setName('joined')
    .setDescription('Muestra cuándo entró un usuario')
    .addUserOption(option =>
      option
        .setName('usuario')
        .setDescription('Usuario')
        .setRequired(false)
    ),

  new SlashCommandBuilder()
    .setName('roles')
    .setDescription('Muestra los roles'),

  // UTILIDAD
  new SlashCommandBuilder()
    .setName('afk')
    .setDescription('Activa tu estado AFK')
    .addStringOption(option =>
      option
        .setName('motivo')
        .setDescription('Motivo del AFK')
        .setRequired(false)
    ),

  new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Muestra el ping'),

  new SlashCommandBuilder()
    .setName('uptime')
    .setDescription('Muestra el tiempo encendido'),

  new SlashCommandBuilder()
    .setName('botinfo')
    .setDescription("Información de King's Assistant"),

  new SlashCommandBuilder()
    .setName('status')
    .setDescription('Muestra el estado del bot'),

  new SlashCommandBuilder()
    .setName('stats')
    .setDescription('Muestra estadísticas'),

  new SlashCommandBuilder()
    .setName('changelog')
    .setDescription('Muestra las actualizaciones'),

  new SlashCommandBuilder()
    .setName('calculate')
    .setDescription('Calcula una operación')
    .addStringOption(option =>
      option
        .setName('operacion')
        .setDescription('Ejemplo: 10 + 5 * 2')
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName('timestamp')
    .setDescription('Genera un timestamp')
    .addIntegerOption(option =>
      option
        .setName('timestamp')
        .setDescription('Timestamp Unix')
        .setRequired(true)
    )

].map(command => command.toJSON());

// ═══════════════════════════════════════════════
// 📡 REGISTRAR COMANDOS
// ═══════════════════════════════════════════════

async function registerCommands() {
  try {
    const rest = new REST({ version: '10' })
      .setToken(process.env.DISCORD_TOKEN);

    await rest.put(
      Routes.applicationGuildCommands(
        process.env.CLIENT_ID,
        process.env.GUILD_ID
      ),
      {
        body: commands
      }
    );

    console.log(`✅ ${commands.length} comandos registrados.`);
  } catch (error) {
    console.error('❌ Error registrando comandos:', error);
  }
}

// ═══════════════════════════════════════════════
// 🛎️ WELCOME
// ═══════════════════════════════════════════════

client.on('guildMemberAdd', async member => {

  console.log(`🛎️ Entró: ${member.user.tag}`);

  const welcomeEmbed = createEmbed(
    '♛ KING THE LAND ♛',
    [
      '🛎️・**CHECK-IN**',
      '',
      `Bienvenido/a a **King the Land**, ${member}!`,
      '',
      '🏨 Tu estancia comienza ahora.',
      '',
      '🛎️ **Recepción**',
      'Conoce nuestra comunidad y sus espacios.',
      '',
      '🛏️ **Habitaciones**',
      'Explora los diferentes canales.',
      '',
      '🎉 **Eventos**',
      'Participa en nuestras actividades.',
      '',
      '💎 **VIP**',
      'Descubre las experiencias disponibles.',
      '',
      '🤝 **Amistades**',
      'Conoce nuevos miembros.',
      '',
      '♛ Esperamos que disfrutes tu estancia. ♛'
    ].join('\n')
  );

  welcomeEmbed.setThumbnail(
    member.user.displayAvatarURL({
      dynamic: true
    })
  );

  await sendToChannel(CONFIG.channels.welcome, {
    content: `${member}`,
    embeds: [welcomeEmbed],
    allowedMentions: {
      users: [member.id]
    }
  });

  await logAction(
    '🛎️ Nuevo miembro',
    `${member.user.tag} entró al servidor.`
  );
});

// ═══════════════════════════════════════════════
// 🚪 LEAVE
// ═══════════════════════════════════════════════

client.on('guildMemberRemove', async member => {

  console.log(`🚪 Salió: ${member.user.tag}`);

  const leaveEmbed = createEmbed(
    '♛ KING THE LAND ♛',
    [
      '🚪・**CHECK-OUT**',
      '',
      `Hasta pronto, ${member.user.tag}.`,
      '',
      '🏨 Tu estancia en King the Land ha llegado a su fin.',
      '',
      'Gracias por compartir:',
      '🛎️ La recepción',
      '🏨 Nuestros espacios',
      '🎉 Los eventos',
      '🤝 Los momentos y amistades',
      '',
      '♛ Esperamos volver a recibirte algún día. ♛'
    ].join('\n')
  );

  await sendToChannel(CONFIG.channels.leave, {
    content: `${member.user}`,
    embeds: [leaveEmbed],
    allowedMentions: {
      users: [member.id]
    }
  });

  await logAction(
    '🚪 Miembro salió',
    `${member.user.tag} salió del servidor.`
  );
});

// ═══════════════════════════════════════════════
// 🎟️ INVITACIONES
// ═══════════════════════════════════════════════

client.on('guildMemberAdd', async member => {

  try {

    const invites = await member.guild.invites.fetch();

    let usedInvite = null;

    for (const invite of invites.values()) {

      const previousUses =
        inviteUses.get(invite.code) || 0;

      if ((invite.uses || 0) > previousUses) {
        usedInvite = invite;
        break;
      }
    }

    for (const invite of invites.values()) {
      inviteUses.set(
        invite.code,
        invite.uses || 0
      );
    }

    if (!usedInvite) return;

    const inviter = usedInvite.inviter;

    const inviteEmbed = createEmbed(
      '🎟️ Nueva invitación',
      [
        `👤 **Nuevo miembro:** ${member}`,
        `🎟️ **Invitado por:** ${inviter || 'Desconocido'}`,
        '',
        '✨ ¡Gracias por ayudar a crecer a King the Land!'
      ].join('\n')
    );

    await sendToChannel(
      CONFIG.channels.invites,
      {
        embeds: [inviteEmbed]
      }
    );

  } catch (error) {
    console.log(
      '⚠️ No se pudo detectar la invitación.'
    );
  }
});

// ═══════════════════════════════════════════════
// 💤 AFK
// ═══════════════════════════════════════════════

async function activateAFK(interaction) {

  const member = interaction.member;

  const reason =
    interaction.options.getString('motivo') ||
    'Sin motivo especificado';

  if (afkUsers.has(member.id)) {

    return interaction.reply({
      content: '💤 Ya tienes el estado AFK activado.',
      ephemeral: true
    });
  }

  const oldNickname = member.nickname;

  afkUsers.set(member.id, {
    reason,
    since: Date.now(),
    oldNickname
  });

  let newNickname =
    `[AFK] ${member.displayName}`;

  if (newNickname.length > 32) {
    newNickname =
      `[AFK] ${member.user.username}`;
  }

  try {
    await member.setNickname(newNickname);
  } catch {
    console.log(
      '⚠️ No se pudo cambiar el nickname.'
    );
  }

  const afkEmbed = createEmbed(
    '💤 Estado AFK',
    `Has activado tu estado AFK.\n\n**Motivo:** ${reason}`
  );

  await interaction.reply({
    embeds: [afkEmbed],
    ephemeral: true
  });
}

async function removeAFK(member) {

  const data = afkUsers.get(member.id);

  if (!data) return;

  afkUsers.delete(member.id);

  try {
    await member.setNickname(
      data.oldNickname
    );
  } catch {
    console.log(
      '⚠️ No se pudo restaurar el nickname.'
    );
  }
}

// ═══════════════════════════════════════════════
// 💬 MENSAJES
// ═══════════════════════════════════════════════

client.on('messageCreate', async message => {

  if (message.author.bot) return;

  // Usuario AFK vuelve a hablar
  if (afkUsers.has(message.author.id)) {

    await removeAFK(message.member);

    const response =
      await message.channel.send(
        `🛎️ Bienvenido/a de vuelta, ${message.author}. Tu estado AFK ha sido retirado.`
      );

    setTimeout(() => {
      response.delete().catch(() => {});
    }, 5000);
  }

  // Mención de usuario AFK
  for (const user of message.mentions.users.values()) {

    const data = afkUsers.get(user.id);

    if (!data) continue;

    const minutes = Math.floor(
      (Date.now() - data.since) / 60000
    );

    const afkEmbed = createEmbed(
      '💤 Usuario AFK',
      [
        `**Usuario:** ${user}`,
        `**Motivo:** ${data.reason}`,
        `**Tiempo AFK:** ${minutes} minuto(s)`
      ].join('\n')
    );

    await message.reply({
      embeds: [afkEmbed],
      allowedMentions: {
        repliedUser: false
      }
    });
  }
});

// ═══════════════════════════════════════════════
// 🏨 SERVERINFO
// ═══════════════════════════════════════════════

function buildServerInfo(guild) {

  const textChannels =
    guild.channels.cache.filter(
      channel =>
        channel.type === ChannelType.GuildText
    ).size;

  const voiceChannels =
    guild.channels.cache.filter(
      channel =>
        channel.type === ChannelType.GuildVoice
    ).size;

  const categories =
    guild.channels.cache.filter(
      channel =>
        channel.type === ChannelType.GuildCategory
    ).size;

  const bots =
    guild.members.cache.filter(
      member => member.user.bot
    ).size;

  const users =
    Math.max(0, guild.memberCount - bots);

  const boosters =
    guild.members.cache.filter(
      member => member.premiumSince
    ).size;

  return createEmbed(
    `🏨 ${guild.name}`,
    [
      '## 📋 Información general',
      `**Nombre:** ${guild.name}`,
      `**ID:** ${guild.id}`,
      `**Propietario:** <@${guild.ownerId}>`,
      `**Creado:** <t:${Math.floor(guild.createdTimestamp / 1000)}:F>`,
      '',
      '## 👥 Miembros',
      `**Total:** ${guild.memberCount}`,
      `**Usuarios:** ${users}`,
      `**Bots:** ${bots}`,
      `**Boosters:** ${boosters}`,
      '',
      '## 🏨 Servidor',
      `**Canales totales:** ${guild.channels.cache.size}`,
      `**Texto:** ${textChannels}`,
      `**Voz:** ${voiceChannels}`,
      `**Categorías:** ${categories}`,
      `**Roles:** ${guild.roles.cache.size}`,
      `**Emojis:** ${guild.emojis.cache.size}`,
      `**Stickers:** ${guild.stickers.cache.size}`,
      '',
      '## 💎 Boost',
      `**Nivel:** ${guild.premiumTier}`,
      `**Boosts:** ${guild.premiumSubscriptionCount || 0}`,
      '',
      '## 📅 Fechas',
      `**Creación:** <t:${Math.floor(guild.createdTimestamp / 1000)}:F>`,
      `**Antigüedad:** <t:${Math.floor(guild.createdTimestamp / 1000)}:R>`,
      '',
      '♛ Información oficial de King the Land ♛'
    ].join('\n')
  );
}

// ═══════════════════════════════════════════════
// 📋 LOGS
// ═══════════════════════════════════════════════

async function getOrCreateLogsChannel(guild) {

  let channel =
    guild.channels.cache.find(
      c =>
        c.name === '📋・logs' &&
        c.type === ChannelType.GuildText
    );

  if (channel) return channel;

  try {

    channel =
      await guild.channels.create({
        name: '📋・logs',
        type: ChannelType.GuildText,
        reason:
          "Canal de logs de King's Assistant"
      });

    console.log(
      `✅ Canal de logs creado: ${channel.id}`
    );

    return channel;

  } catch (error) {

    console.error(
      '❌ No se pudo crear el canal de logs.',
      error
    );

    return null;
  }
}

async function logAction(title, description) {

  const guild =
    client.guilds.cache.get(CONFIG.guildId);

  if (!guild) return;

  const channel =
    await getOrCreateLogsChannel(guild);

  if (!channel) return;

  const logEmbed =
    createEmbed(title, description);

  await channel.send({
    embeds: [logEmbed]
  }).catch(() => {});
}

// ═══════════════════════════════════════════════
// 🧩 INTERACCIONES
// ═══════════════════════════════════════════════

client.on('interactionCreate', async interaction => {

  if (!interaction.isChatInputCommand()) return;

  try {

    // AFK
    if (interaction.commandName === 'afk') {
      return activateAFK(interaction);
    }

    // PING
    if (interaction.commandName === 'ping') {

      return interaction.reply({
        embeds: [
          createEmbed(
            '🏓 Pong',
            `Latencia: **${client.ws.ping}ms**`
          )
        ]
      });
    }

    // UPTIME
    if (interaction.commandName === 'uptime') {

      const totalSeconds =
        Math.floor(process.uptime());

      const days =
        Math.floor(totalSeconds / 86400);

      const hours =
        Math.floor((totalSeconds % 86400) / 3600);

      const minutes =
        Math.floor((totalSeconds % 3600) / 60);

      const seconds =
        totalSeconds % 60;

      return interaction.reply({
        embeds: [
          createEmbed(
            '⏱️ Uptime',
            `**${days}d ${hours}h ${minutes}m ${seconds}s**`
          )
        ]
      });
    }

    // BOTINFO
    if (interaction.commandName === 'botinfo') {

      return interaction.reply({
        embeds: [
          createEmbed(
            "♛ KING'S ASSISTANT ♛",
            [
              '**Bot privado de King the Land**',
              '',
              `🤖 **Usuario:** ${client.user}`,
              `🏨 **Servidores:** ${client.guilds.cache.size}`,
              `📡 **Ping:** ${client.ws.ping}ms`,
              `⚙️ **Discord.js:** ${require('discord.js').version}`,
              `🟢 **Node.js:** ${process.version}`
            ].join('\n')
          )
        ]
      });
    }

    // STATUS
    if (interaction.commandName === 'status') {

      return interaction.reply({
        embeds: [
          createEmbed(
            '🟢 Estado',
            [
              '**King\'s Assistant está operativo.**',
              '',
              '📡 Discord: Conectado',
              '🏨 Servidor: Conectado',
              `📶 Ping: ${client.ws.ping}ms`
            ].join('\n')
          )
        ]
      });
    }

    // STATS
    if (interaction.commandName === 'stats') {

      return interaction.reply({
        embeds: [
          createEmbed(
            '📊 Estadísticas',
            [
              `👥 Miembros: ${client.guilds.cache.reduce(
                (total, guild) =>
                  total + guild.memberCount,
                0
              )}`,
              `🏨 Servidores: ${client.guilds.cache.size}`,
              `⚙️ Comandos: ${commands.length}`,
              `💤 AFK activos: ${afkUsers.size}`
            ].join('\n')
          )
        ]
      });
    }

    // SERVERINFO
    if (interaction.commandName === 'serverinfo') {

      return interaction.reply({
        embeds: [
          buildServerInfo(interaction.guild)
        ]
      });
    }

    // MEMBERCOUNT
    if (interaction.commandName === 'membercount') {

      return interaction.reply({
        embeds: [
          createEmbed(
            '👥 Miembros',
            `King the Land tiene **${interaction.guild.memberCount} miembros**.`
          )
        ]
      });
    }

    // BOOSTERS
    if (interaction.commandName === 'boosters') {

      const boosters =
        interaction.guild.members.cache
          .filter(member => member.premiumSince)
          .map(member => member.user)
          .slice(0, 30);

      return interaction.reply({
        embeds: [
          createEmbed(
            '💎 Boosters',
            boosters.length
              ? boosters.map(user => `💎 ${user}`).join('\n')
              : 'Actualmente no hay boosters visibles.'
          )
        ]
      });
    }

    // USERINFO
    if (interaction.commandName === 'userinfo') {

      const user =
        interaction.options.getUser('usuario') ||
        interaction.user;

      const member =
        interaction.guild.members.cache.get(user.id);

      return interaction.reply({
        embeds: [
          createEmbed(
            `👤 ${user.username}`,
            [
              `**ID:** ${user.id}`,
              `**Cuenta creada:** <t:${Math.floor(user.createdTimestamp / 1000)}:F>`,
              member
                ? `**Entró:** <t:${Math.floor(member.joinedTimestamp / 1000)}:F>`
                : '',
              member
                ? `**Roles:** ${Math.max(0, member.roles.cache.size - 1)}`
                : ''
            ].filter(Boolean).join('\n')
          ).setThumbnail(
            user.displayAvatarURL({
              dynamic: true
            })
          )
        ]
      });
    }

    // AVATAR
    if (interaction.commandName === 'avatar') {

      const user =
        interaction.options.getUser('usuario') ||
        interaction.user;

      const avatar =
        user.displayAvatarURL({
          size: 1024,
          extension: 'png'
        });

      return interaction.reply({
        embeds: [
          createEmbed(
            `🖼️ Avatar de ${user.username}`,
            `[Abrir avatar](${avatar})`
          ).setImage(avatar)
        ]
      });
    }

    // ROLEINFO
    if (interaction.commandName === 'roleinfo') {

      const role =
        interaction.options.getRole('rol');

      return interaction.reply({
        embeds: [
          createEmbed(
            `🎭 ${role.name}`,
            [
              `**ID:** ${role.id}`,
              `**Miembros:** ${role.members.size}`,
              `**Posición:** ${role.position}`,
              `**Mencionable:** ${role.mentionable ? 'Sí' : 'No'}`
            ].join('\n')
          )
        ]
      });
    }

    // CHANNELINFO
    if (interaction.commandName === 'channelinfo') {

      const channel =
        interaction.options.getChannel('canal') ||
        interaction.channel;

      return interaction.reply({
        embeds: [
          createEmbed(
            `📁 ${channel.name}`,
            [
              `**ID:** ${channel.id}`,
              `**Tipo:** ${channel.type}`,
              `**Creado:** <t:${Math.floor(channel.createdTimestamp / 1000)}:F>`
            ].join('\n')
          )
        ]
      });
    }

    // SERVERICON
    if (interaction.commandName === 'servericon') {

      const icon =
        interaction.guild.iconURL({
          size: 1024,
          extension: 'png'
        });

      return interaction.reply({
        embeds: [
          createEmbed(
            '🏨 Icono del servidor',
            icon
              ? `[Abrir icono](${icon})`
              : 'El servidor no tiene icono.'
          ).setImage(icon)
        ]
      });
    }

    // SERVERBANNER
    if (interaction.commandName === 'serverbanner') {

      const banner =
        interaction.guild.bannerURL({
          size: 2048,
          extension: 'png'
        });

      return interaction.reply({
        embeds: [
          createEmbed(
            '🖼️ Banner del servidor',
            banner
              ? `[Abrir banner](${banner})`
              : 'El servidor no tiene banner disponible.'
          ).setImage(banner)
        ]
      });
    }

    // JOINED
    if (interaction.commandName === 'joined') {

      const user =
        interaction.options.getUser('usuario') ||
        interaction.user;

      const member =
        await interaction.guild.members.fetch(user.id);

      return interaction.reply({
        embeds: [
          createEmbed(
            '📅 Entrada al servidor',
            `${user} entró el <t:${Math.floor(member.joinedTimestamp / 1000)}:F>`
          )
        ]
      });
    }

    // ROLES
    if (interaction.commandName === 'roles') {

      const roles =
        interaction.guild.roles.cache
          .filter(role =>
            role.id !== interaction.guild.id
          )
          .sort((a, b) =>
            b.position - a.position
          )
          .map(role => role.toString())
          .slice(0, 50);

      return interaction.reply({
        embeds: [
          createEmbed(
            '🎭 Roles',
            roles.length
              ? roles.join('\n')
              : 'No hay roles.'
          )
        ]
      });
    }

    // HELP
    if (interaction.commandName === 'help') {

      return interaction.reply({
        embeds: [
          createEmbed(
            "♛ KING'S ASSISTANT — AYUDA",
            [
              '### 🎉 Diversión',
              '`/8ball` `/coinflip` `/dice` `/rps`',
              '`/choose` `/random` `/wyr` `/joke`',
              '`/compliment` `/fortune`',
              '',
              '### ℹ️ Información',
              '`/help` `/serverinfo` `/userinfo` `/roleinfo`',
              '`/channelinfo` `/avatar` `/membercount`',
              '`/boosters` `/staff` `/rules` `/links`',
              '`/servericon` `/serverbanner` `/joined` `/roles`',
              '',
              '### 🛠️ Utilidad',
              '`/afk` `/ping` `/uptime` `/botinfo`',
              '`/status` `/stats` `/changelog`',
              '`/calculate` `/timestamp`'
            ].join('\n')
          )
        ]
      });
    }

    // 8BALL
    if (interaction.commandName === '8ball') {

      const answers = [
        '✨ Definitivamente.',
        '🏨 Es muy probable.',
        '👑 Sí.',
        '🤔 Puede ser.',
        '🎭 No estoy seguro.',
        '❌ Probablemente no.',
        '🚪 No.',
        '🛎️ Pregunta nuevamente más tarde.'
      ];

      const question =
        interaction.options.getString('pregunta');

      const answer =
        answers[
          Math.floor(
            Math.random() * answers.length
          )
        ];

      return interaction.reply({
        embeds: [
          createEmbed(
            '🎱 8Ball',
            `**Pregunta:** ${question}\n\n**Respuesta:** ${answer}`
          )
        ]
      });
    }

    // COINFLIP
    if (interaction.commandName === 'coinflip') {

      const result =
        Math.random() < 0.5
          ? 'Cara'
          : 'Cruz';

      return interaction.reply({
        embeds: [
          createEmbed(
            '🪙 Moneda',
            `Resultado: **${result}**`
          )
        ]
      });
    }

    // DICE
    if (interaction.commandName === 'dice') {

      const result =
        Math.floor(Math.random() * 6) + 1;

      return interaction.reply({
        embeds: [
          createEmbed(
            '🎲 Dado',
            `Resultado: **${result}**`
          )
        ]
      });
    }

    // CHOOSE
    if (interaction.commandName === 'choose') {

      const options =
        interaction.options
          .getString('opciones')
          .split(',')
          .map(option => option.trim())
          .filter(Boolean);

      if (!options.length) {
        return interaction.reply({
          content: '❌ No proporcionaste opciones.',
          ephemeral: true
        });
      }

      const selected =
        options[
          Math.floor(
            Math.random() * options.length
          )
        ];

      return interaction.reply({
        embeds: [
          createEmbed(
            '🎯 Elección',
            `👑 Elegí: **${selected}**`
          )
        ]
      });
    }

    // RANDOM
    if (interaction.commandName === 'random') {

      const max =
        interaction.options.getInteger('maximo');

      const result =
        Math.floor(Math.random() * max) + 1;

      return interaction.reply({
        embeds: [
          createEmbed(
            '🎲 Número aleatorio',
            `Resultado: **${result}**`
          )
        ]
      });
    }

    // RPS
    if (interaction.commandName === 'rps') {

      const userChoice =
        interaction.options.getString('eleccion');

      const choices = [
        'piedra',
        'papel',
        'tijera'
      ];

      const botChoice =
        choices[
          Math.floor(
            Math.random() * choices.length
          )
        ];

      let result;

      if (userChoice === botChoice) {
        result = '🤝 Empate.';
      } else if (
        (userChoice === 'piedra' &&
          botChoice === 'tijera') ||
        (userChoice === 'papel' &&
          botChoice === 'piedra') ||
        (userChoice === 'tijera' &&
          botChoice === 'papel')
      ) {
        result = '👑 Ganaste.';
      } else {
        result = '🎭 Esta ronda la gano yo.';
      }

      return interaction.reply({
        embeds: [
          createEmbed(
            '✊ Piedra, Papel o Tijera',
            [
              `Tu elección: **${userChoice}**`,
              `Mi elección: **${botChoice}**`,
              '',
              result
            ].join('\n')
          )
        ]
      });
    }

    // WYR
    if (interaction.commandName === 'wyr') {

      const questions = [
        '¿Qué prefieres: viajar al pasado o al futuro?',
        '¿Qué prefieres: tener suerte o talento?',
        '¿Qué prefieres: vivir en la ciudad o en el campo?',
        '¿Qué prefieres: tener mucho tiempo o mucho dinero?'
      ];

      const question =
        questions[
          Math.floor(
            Math.random() * questions.length
          )
        ];

      return interaction.reply({
        embeds: [
          createEmbed(
            '🤔 ¿Qué prefieres?',
            question
          )
        ]
      });
    }

    // JOKE
    if (interaction.commandName === 'joke') {

      const jokes = [
        '😂 ¿Qué hace una abeja en el gimnasio? ¡Zum-ba!',
        '😂 ¿Qué le dijo un techo a otro? Techo de menos.',
        '😂 ¿Cuál es el colmo de un jardinero? Que lo dejen plantado.'
      ];

      const joke =
        jokes[
          Math.floor(
            Math.random() * jokes.length
          )
        ];

      return interaction.reply({
        embeds: [
          createEmbed(
            '😂 Chiste',
            joke
          )
        ]
      });
    }

    // COMPLIMENT
    if (interaction.commandName === 'compliment') {

      const compliments = [
        '✨ Tienes una energía increíble.',
        '👑 Tu presencia mejora la comunidad.',
        '💎 Eres alguien especial.',
        '🏨 Siempre eres bienvenido/a aquí.'
      ];

      return interaction.reply({
        embeds: [
          createEmbed(
            '💎 Cumplido',
            compliments[
              Math.floor(
                Math.random() * compliments.length
              )
            ]
          )
        ]
      });
    }

    // FORTUNE
    if (interaction.commandName === 'fortune') {

      const fortunes = [
        '✨ Algo interesante podría ocurrir pronto.',
        '👑 Un buen momento puede estar cerca.',
        '🏨 Hoy podría ser un día diferente.',
        '💎 Mantente atento a nuevas oportunidades.'
      ];

      return interaction.reply({
        embeds: [
          createEmbed(
            '🔮 Fortuna',
            fortunes[
              Math.floor(
                Math.random() * fortunes.length
              )
            ]
          )
        ]
      });
    }

    // CALCULATE
    if (interaction.commandName === 'calculate') {

      const operation =
        interaction.options.getString('operacion');

      if (
        !/^[0-9+\-*/().%\s]+$/.test(
          operation
        )
      ) {
        return interaction.reply({
          content: '❌ Operación no válida.',
          ephemeral: true
        });
      }

      try {

        const result =
          Function(
            `"use strict"; return (${operation})`
          )();

        return interaction.reply({
          embeds: [
            createEmbed(
              '🧮 Calculadora',
              `\`${operation}\` = **${result}**`
            )
          ]
        });

      } catch {

        return interaction.reply({
          content:
            '❌ No pude calcular esa operación.',
          ephemeral: true
        });
      }
    }

    // TIMESTAMP
    if (interaction.commandName === 'timestamp') {

      const timestamp =
        interaction.options.getInteger(
          'timestamp'
        );

      return interaction.reply({
        embeds: [
          createEmbed(
            '⏰ Timestamp',
            [
              `Unix: \`${timestamp}\``,
              '',
              `<t:${timestamp}:F>`,
              `<t:${timestamp}:R>`
            ].join('\n')
          )
        ]
      });
    }

    // STAFF
    if (interaction.commandName === 'staff') {

      return interaction.reply({
        embeds: [
          createEmbed(
            '🛡️ Staff',
            `Consulta la guía del Staff en <#${CONFIG.channels.staffGuide}>.`
          )
        ]
      });
    }

    // RULES
    if (interaction.commandName === 'rules') {

      return interaction.reply({
        embeds: [
          createEmbed(
            '📜 Reglas',
            `Consulta las reglas en <#${CONFIG.channels.rules}>.`
          )
        ]
      });
    }

    // LINKS
    if (interaction.commandName === 'links') {

      return interaction.reply({
        embeds: [
          createEmbed(
            '🔗 Enlaces importantes',
            [
              `📜 Reglas: <#${CONFIG.channels.rules}>`,
              `🏨 Información: <#${CONFIG.channels.serverInfo}>`,
              `⚖️ Apelaciones: <#${CONFIG.channels.appeals}>`,
              '',
              `⚖️ Servidor de apelaciones: ${CONFIG.appealServer}`
            ].join('\n')
          )
        ]
      });
    }

    // CHANGELOG
    if (interaction.commandName === 'changelog') {

      return interaction.reply({
        embeds: [
          createEmbed(
            '📋 Changelog',
            [
              '### v1.0',
              '✅ Sistema base',
              '✅ Welcome',
              '✅ Leave',
              '✅ AFK',
              '✅ Invitaciones',
              '✅ Serverinfo',
              '✅ Comandos Fun',
              '✅ Comandos Information',
              '✅ Comandos Utility'
            ].join('\n')
          )
        ]
      });
    }

  } catch (error) {

    console.error(
      '❌ Error ejecutando comando:',
      error
    );

    if (
      interaction.replied ||
      interaction.deferred
    ) {
      await interaction.followUp({
        content:
          '❌ Ocurrió un error ejecutando el comando.',
        ephemeral: true
      }).catch(() => {});
    } else {
      await interaction.reply({
        content:
          '❌ Ocurrió un error ejecutando el comando.',
        ephemeral: true
      }).catch(() => {});
    }
  }
});

// ═══════════════════════════════════════════════
// 🚀 CLIENT READY
// ═══════════════════════════════════════════════

client.once('clientReady', async () => {

  console.log('════════════════════════════════════');
  console.log("♛ KING'S ASSISTANT ♛");
  console.log(`✅ Conectado como ${client.user.tag}`);
  console.log(
    `🏨 Servidores: ${client.guilds.cache.size}`
  );
  console.log('════════════════════════════════════');

  const guild =
    client.guilds.cache.get(
      CONFIG.guildId
    );

  if (!guild) {

    console.error(
      '❌ No se encontró el servidor configurado.'
    );

    return;
  }

  await getOrCreateLogsChannel(guild);

  await logAction(
    '🚀 Bot iniciado',
    `**King's Assistant** se conectó correctamente.\n\nServidor: **${guild.name}**`
  );

  await registerCommands();
});

// ═══════════════════════════════════════════════
// ⚠️ ERRORES
// ═══════════════════════════════════════════════

client.on('error', error => {
  console.error(
    '❌ Error del cliente:',
    error
  );
});

process.on('unhandledRejection', error => {
  console.error(
    '❌ Unhandled Rejection:',
    error
  );
});

process.on('uncaughtException', error => {
  console.error(
    '❌ Uncaught Exception:',
    error
  );
});

// ═══════════════════════════════════════════════
// 🔐 VARIABLES
// ═══════════════════════════════════════════════

if (!process.env.DISCORD_TOKEN) {
  console.error(
    '❌ Falta DISCORD_TOKEN.'
  );
  process.exit(1);
}

if (!process.env.CLIENT_ID) {
  console.error(
    '❌ Falta CLIENT_ID.'
  );
  process.exit(1);
}

if (!process.env.GUILD_ID) {
  console.error(
    '❌ Falta GUILD_ID.'
  );
  process.exit(1);
}

// ═══════════════════════════════════════════════
// 🔑 LOGIN
// ═══════════════════════════════════════════════

client.login(
  process.env.DISCORD_TOKEN
);
