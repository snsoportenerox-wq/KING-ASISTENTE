require('dotenv').config();

const {
  Client,
  GatewayIntentBits,
  Partials,
  EmbedBuilder,
  PermissionsBitField,
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
    staffRules: '1538681139333170283',
    appeals: '1538681130776010761',
    serverInfo: '1538681130293923890'
  },

  appealServer: 'https://discord.gg/HXKYDk6RGD'
};

// ═══════════════════════════════════════════════
// 💾 DATOS TEMPORALES
// Sin base de datos
// ═══════════════════════════════════════════════

const afkUsers = new Map();
const inviteUses = new Map();

// ═══════════════════════════════════════════════
// 🎨 FUNCIONES
// ═══════════════════════════════════════════════

function embed(title, description = '') {
  return new EmbedBuilder()
    .setColor(0xD4AF37)
    .setTitle(title)
    .setDescription(description)
    .setTimestamp();
}

function getChannel(id) {
  return client.channels.cache.get(id);
}

async function sendChannel(id, message) {
  const channel = getChannel(id);

  if (!channel) {
    console.log(`⚠️ Canal no encontrado: ${id}`);
    return null;
  }

  try {
    return await channel.send(message);
  } catch (error) {
    console.error(`❌ Error enviando mensaje al canal ${id}:`, error);
    return null;
  }
}

// ═══════════════════════════════════════════════
// 📋 COMANDOS
// ═══════════════════════════════════════════════

const commands = [

  // ───────── FUN ─────────

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
    .setDescription('Elige entre varias opciones')
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
    .setDescription('Pregunta ¿Qué prefieres?'),

  new SlashCommandBuilder()
    .setName('joke')
    .setDescription('Cuenta un chiste'),

  new SlashCommandBuilder()
    .setName('compliment')
    .setDescription('Envía un cumplido'),

  new SlashCommandBuilder()
    .setName('fortune')
    .setDescription('Recibe una predicción divertida'),

  // ───────── INFORMACIÓN ─────────

  new SlashCommandBuilder()
    .setName('help')
    .setDescription('Muestra los comandos disponibles'),

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
    .setDescription('Muestra el avatar de un usuario')
    .addUserOption(option =>
      option
        .setName('usuario')
        .setDescription('Usuario')
        .setRequired(false)
    ),

  new SlashCommandBuilder()
    .setName('membercount')
    .setDescription('Muestra el número de miembros'),

  new SlashCommandBuilder()
    .setName('boosters')
    .setDescription('Muestra los boosters'),

  new SlashCommandBuilder()
    .setName('staff')
    .setDescription('Información del Staff'),

  new SlashCommandBuilder()
    .setName('rules')
    .setDescription('Información sobre las reglas'),

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
    .setDescription('Muestra los roles del servidor'),

  // ───────── UTILIDAD ─────────

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
    .setDescription('Muestra el ping del bot'),

  new SlashCommandBuilder()
    .setName('uptime')
    .setDescription('Muestra cuánto lleva encendido el bot'),

  new SlashCommandBuilder()
    .setName('botinfo')
    .setDescription('Información de King's Assistant'),

  new SlashCommandBuilder()
    .setName('status')
    .setDescription('Muestra el estado del bot'),

  new SlashCommandBuilder()
    .setName('stats')
    .setDescription('Muestra estadísticas del bot'),

  new SlashCommandBuilder()
    .setName('changelog')
    .setDescription('Muestra las últimas actualizaciones'),

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
    .setDescription('Genera un timestamp de Discord')
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
      { body: commands }
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

  const welcomeEmbed = embed(
    '♛ KING THE LAND ♛',
    [
      '🛎️・**CHECK-IN**',
      '',
      `Bienvenido/a a **King the Land**, ${member}!`,
      '',
      '🏨 Tu estancia comienza ahora.',
      '',
      '🛎️ **Recepción**',
      'Aquí podrás conocer nuestra comunidad.',
      '',
      '🛏️ **Habitaciones**',
      'Explora los diferentes espacios del servidor.',
      '',
      '🎉 **Eventos**',
      'Participa en nuestras actividades.',
      '',
      '💎 **VIP**',
      'Descubre los beneficios y experiencias disponibles.',
      '',
      '🤝 **Amistades**',
      'Conoce nuevos miembros y forma parte de la comunidad.',
      '',
      '♛ Esperamos que disfrutes tu estancia. ♛'
    ].join('\n')
  );

  welcomeEmbed.setThumbnail(
    member.user.displayAvatarURL({ dynamic: true })
  );

  await sendChannel(CONFIG.channels.welcome, {
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

  const leaveEmbed = embed(
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

  await sendChannel(CONFIG.channels.leave, {
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
// 💤 AFK
// ═══════════════════════════════════════════════

async function activateAFK(interaction) {

  const member = interaction.member;
  const reason =
    interaction.options.getString('motivo') ||
    'Sin motivo especificado';

  const oldNickname = member.nickname;

  afkUsers.set(member.id, {
    reason,
    since: Date.now(),
    oldNickname
  });

  let newNickname = `[AFK] ${member.displayName}`;

  if (newNickname.length > 32) {
    newNickname = `[AFK] ${member.user.username}`;
  }

  try {
    await member.setNickname(newNickname);
  } catch (error) {
    console.log('⚠️ No se pudo cambiar el nickname.');
  }

  const afkEmbed = embed(
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
    await member.setNickname(data.oldNickname);
  } catch (error) {
    console.log('⚠️ No se pudo restaurar el nickname.');
  }
}

// ═══════════════════════════════════════════════
// 💬 MENSAJES
// ═══════════════════════════════════════════════

client.on('messageCreate', async message => {

  if (message.author.bot) return;

  // Quitar AFK al hablar
  if (afkUsers.has(message.author.id)) {

    const member = message.member;

    await removeAFK(member);

    const msg = await message.channel.send(
      `🛎️ Bienvenido/a de vuelta, ${message.author}. Tu estado AFK ha sido retirado.`
    );

    setTimeout(() => {
      msg.delete().catch(() => {});
    }, 5000);
  }

  // Detectar menciones de usuarios AFK
  for (const user of message.mentions.users.values()) {

    const data = afkUsers.get(user.id);

    if (!data) continue;

    const elapsed = Date.now() - data.since;
    const minutes = Math.floor(elapsed / 60000);

    const afkEmbed = embed(
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
// 🎟️ INVITACIONES
// ═══════════════════════════════════════════════

client.on('guildMemberAdd', async member => {

  try {
    const invites = await member.guild.invites.fetch();

    let usedInvite = null;

    for (const invite of invites.values()) {

      const previousUses =
        inviteUses.get(invite.code) || 0;

      if (invite.uses > previousUses) {
        usedInvite = invite;
        break;
      }
    }

    for (const invite of invites.values()) {
      inviteUses.set(invite.code, invite.uses || 0);
    }

    if (!usedInvite) return;

    const inviter = usedInvite.inviter;

    const inviteEmbed = embed(
      '🎟️ Nueva invitación',
      [
        `👤 **Nuevo miembro:** ${member}`,
        `🎟️ **Invitado por:** ${inviter || 'Desconocido'}`,
        '',
        '✨ ¡Gracias por ayudar a crecer a King the Land!'
      ].join('\n')
    );

    await sendChannel(CONFIG.channels.invites, {
      embeds: [inviteEmbed]
    });

  } catch (error) {
    console.log('⚠️ No se pudo identificar la invitación utilizada.');
  }
});

// ═══════════════════════════════════════════════
// 🏨 SERVERINFO
// ═══════════════════════════════════════════════

function serverInfoEmbed(guild) {

  const textChannels = guild.channels.cache.filter(
    c => c.type === ChannelType.GuildText
  ).size;

  const voiceChannels = guild.channels.cache.filter(
    c => c.type === ChannelType.GuildVoice
  ).size;

  const categories = guild.channels.cache.filter(
    c => c.type === ChannelType.GuildCategory
  ).size;

  const bots = guild.members.cache.filter(
    member => member.user.bot
  ).size;

  const users = guild.memberCount - bots;

  const boosters = guild.members.cache.filter(
    member => member.premiumSince
  ).size;

  return embed(
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
      `**Canales de texto:** ${textChannels}`,
      `**Canales de voz:** ${voiceChannels}`,
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
// 📝 INTERACCIONES
// ═══════════════════════════════════════════════

client.on('interactionCreate', async interaction => {

  if (!interaction.isChatInputCommand()) return;

  const { commandName } = interaction;

  try {

    // ───────── AFK ─────────

    if (commandName === 'afk') {
      return activateAFK(interaction);
    }

    // ───────── PING ─────────

    if (commandName === 'ping') {

      const ping = client.ws.ping;

      return interaction.reply({
        embeds: [
          embed(
            '🏓 Pong',
            `Latencia: **${ping}ms**`
          )
        ]
      });
    }

    // ───────── UPTIME ─────────

    if (commandName === 'uptime') {

      const seconds = Math.floor(process.uptime());

      const days = Math.floor(seconds / 86400);
      const hours = Math.floor((seconds % 86400) / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const secs = seconds % 60;

      return interaction.reply({
        embeds: [
          embed(
            '⏱️ Uptime',
            `**${days}d ${hours}h ${minutes}m ${secs}s**`
          )
        ]
      });
    }

    // ───────── BOTINFO ─────────

    if (commandName === 'botinfo') {

      return interaction.reply({
        embeds: [
          embed(
            '♛ KING\'S ASSISTANT ♛',
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

    // ───────── STATUS ─────────

    if (commandName === 'status') {

      return interaction.reply({
        embeds: [
          embed(
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

    // ───────── STATS ─────────

    if (commandName === 'stats') {

      return interaction.reply({
        embeds: [
          embed(
            '📊 Estadísticas',
            [
              `👥 Usuarios: ${client.guilds.cache.reduce((a, g) => a + g.memberCount, 0)}`,
              `🏨 Servidores: ${client.guilds.cache.size}`,
              `⚙️ Comandos: ${commands.length}`,
              `💤 AFK activos: ${afkUsers.size}`
            ].join('\n')
          )
        ]
      });
    }

    // ───────── SERVERINFO ─────────

    if (commandName === 'serverinfo') {

      return interaction.reply({
        embeds: [
          serverInfoEmbed(interaction.guild)
        ]
      });
    }

    // ───────── MEMBERCOUNT ─────────

    if (commandName === 'membercount') {

      return interaction.reply({
        embeds: [
          embed(
            '👥 Miembros',
            `King the Land tiene actualmente **${interaction.guild.memberCount} miembros**.`
          )
        ]
      });
    }

    // ───────── BOOSTERS ─────────

    if (commandName === 'boosters') {

      const boosters = interaction.guild.members.cache
        .filter(member => member.premiumSince)
        .map(member => member.user)
        .slice(0, 30);

      return interaction.reply({
        embeds: [
          embed(
            '💎 Boosters',
            boosters.length
              ? boosters.map(user => `💎 ${user}`).join('\n')
              : 'Actualmente no hay boosters visibles.'
          )
        ]
      });
    }

    // ───────── USERINFO ─────────

    if (commandName === 'userinfo') {

      const user =
        interaction.options.getUser('usuario') ||
        interaction.user;

      const member =
        interaction.guild.members.cache.get(user.id);

      return interaction.reply({
        embeds: [
          embed(
            `👤 ${user.username}`,
            [
              `**ID:** ${user.id}`,
              `**Cuenta creada:** <t:${Math.floor(user.createdTimestamp / 1000)}:F>`,
              member
                ? `**Entró al servidor:** <t:${Math.floor(member.joinedTimestamp / 1000)}:F>`
                : '',
              member
                ? `**Roles:** ${member.roles.cache.size - 1}`
                : ''
            ].filter(Boolean).join('\n')
          ).setThumbnail(
            user.displayAvatarURL({ dynamic: true })
          )
        ]
      });
    }

    // ───────── AVATAR ─────────

    if (commandName === 'avatar') {

      const user =
        interaction.options.getUser('usuario') ||
        interaction.user;

      return interaction.reply({
        embeds: [
          embed(
            `🖼️ Avatar de ${user.username}`,
            `[Abrir avatar](${user.displayAvatarURL({
              size: 1024,
              extension: 'png'
            })})`
          ).setImage(
            user.displayAvatarURL({
              size: 1024,
              extension: 'png'
            })
          )
        ]
      });
    }

    // ───────── ROLEINFO ─────────

    if (commandName === 'roleinfo') {

      const role = interaction.options.getRole('rol');

      return interaction.reply({
        embeds: [
          embed(
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

    // ───────── CHANNELINFO ─────────

    if (commandName === 'channelinfo') {

      const channel =
        interaction.options.getChannel('canal') ||
        interaction.channel;

      return interaction.reply({
        embeds: [
          embed(
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

    // ───────── SERVERICON ─────────

    if (commandName === 'servericon') {

      const icon = interaction.guild.iconURL({
        size: 1024,
        extension: 'png'
      });

      return interaction.reply({
        embeds: [
          embed(
            '🏨 Icono del servidor',
            icon ? `[Abrir icono](${icon})` : 'El servidor no tiene icono.'
          ).setImage(icon)
        ]
      });
    }

    // ───────── SERVERBANNER ─────────

    if (commandName === 'serverbanner') {

      const banner = interaction.guild.bannerURL({
        size: 2048,
        extension: 'png'
      });

      return interaction.reply({
        embeds: [
          embed(
            '🖼️ Banner del servidor',
            banner
              ? `[Abrir banner](${banner})`
              : 'El servidor no tiene un banner disponible.'
          ).setImage(banner)
        ]
      });
    }

    // ───────── JOINED ─────────

    if (commandName === 'joined') {

      const user =
        interaction.options.getUser('usuario') ||
        interaction.user;

      const member =
        await interaction.guild.members.fetch(user.id);

      return interaction.reply({
        embeds: [
          embed(
            '📅 Entrada al servidor',
            `${user} entró el <t:${Math.floor(member.joinedTimestamp / 1000)}:F>`
          )
        ]
      });
    }

    // ───────── ROLES ─────────

    if (commandName === 'roles') {

      const roles = interaction.guild.roles.cache
        .filter(role => role.id !== interaction.guild.id)
        .sort((a, b) => b.position - a.position)
        .map(role => role.toString())
        .slice(0, 50);

      return interaction.reply({
        embeds: [
          embed(
            '🎭 Roles',
            roles.length
              ? roles.join('\n')
              : 'No hay roles.'
          )
        ]
      });
    }

    // ───────── HELP ─────────

    if (commandName === 'help') {

      return interaction.reply({
        embeds: [
          embed(
            '♛ KING\'S ASSISTANT — AYUDA',
            [
              '### 🎉 Diversión',
              '`/8ball` `/coinflip` `/dice` `/rps` `/choose`',
              '`/random` `/wyr` `/joke` `/compliment` `/fortune`',
              '',
              '### ℹ️ Información',
              '`/serverinfo` `/userinfo` `/roleinfo` `/channelinfo`',
              '`/avatar` `/membercount` `/boosters` `/staff` `/rules`',
              '`/links` `/servericon` `/serverbanner` `/joined` `/roles`',
              '',
              '### 🛠️ Utilidad',
              '`/afk` `/ping` `/uptime` `/botinfo` `/status`',
              '`/stats` `/changelog` `/calculate` `/timestamp`'
            ].join('\n')
          )
        ]
      });
    }

    // ───────── 8BALL ─────────

    if (commandName === '8ball') {

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

      return interaction.reply({
        embeds: [
          embed(
            '🎱 8Ball',
            `**Pregunta:** ${question}\n\n**Respuesta:** ${answers[Math.floor(Math.random() * answers.length)]}`
          )
        ]
      });
    }

    // ───────── COINFLIP ─────────

    if (commandName === 'coinflip') {

      const result =
        Math.random() < 0.5
          ? '🪙 Cara'
          : '🪙 Cruz';

      return interaction.reply({
        embeds: [
          embed('🪙 Moneda', `Resultado: **${result}**`)
        ]
      });
    }

    // ───────── DICE ─────────

    if (commandName === 'dice') {

      const result =
        Math.floor(Math.random() * 6) + 1;

      return interaction.reply({
        embeds: [
          embed('🎲 Dado', `Resultado: **${result}**`)
        ]
      });
    }

    // ───────── CHOOSE ─────────

    if (commandName === 'choose') {

      const options =
        interaction.options
          .getString('opciones')
          .split(',')
          .map(x => x.trim())
          .filter(Boolean);

      const selected =
        options[Math.floor(Math.random() * options.length)];

      return interaction.reply({
        embeds: [
          embed(
            '🎯 Elección',
            `Opciones: ${options.join(', ')}\n\n👑 Elegí: **${selected}**`
          )
        ]
      });
    }

    // ───────── RANDOM ─────────

    if (commandName === 'random') {

      const max =
        interaction.options.getInteger('maximo');

      const result =
        Math.floor(Math.random() * max) + 1;

      return interaction.reply({
        embeds: [
          embed(
            '🎲 Número aleatorio',
            `Resultado: **${result}**`
          )
        ]
      });
    }

    // ───────── RPS ─────────

    if (commandName === 'rps') {

      const userChoice =
        interaction.options.getString('eleccion');

      const choices = ['piedra', 'papel', 'tijera'];

      const botChoice =
        choices[Math.floor(Math.random() * choices.length)];

      let result;

      if (userChoice === botChoice) {
        result = '🤝 Empate.';
      } else if (
        (userChoice === 'piedra' && botChoice === 'tijera') ||
        (userChoice === 'papel' && botChoice === 'piedra') ||
        (userChoice === 'tijera' && botChoice === 'papel')
      ) {
        result = '👑 Ganaste.';
      } else {
        result = '🎭 Perdí yo...';
      }

      return interaction.reply({
        embeds: [
          embed(
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

    // ───────── WYR ─────────

    if (commandName === 'wyr') {

      const questions = [
        '¿Qué prefieres: viajar al pasado o al futuro?',
        '¿Qué prefieres: tener suerte o tener talento?',
        '¿Qué prefieres: ser famoso o tener mucho dinero?',
        '¿Qué prefieres: vivir en la ciudad o en el campo?'
      ];

      return interaction.reply({
        embeds: [
          embed(
            '🤔 ¿Qué prefieres?',
            questions[Math.floor(Math.random() * questions.length)]
          )
        ]
      });
    }

    // ───────── JOKE ─────────

    if (commandName === 'joke') {

      const jokes = [
        '😂 ¿Qué hace una abeja en el gimnasio? ¡Zum-ba!',
        '😂 ¿Qué le dijo un techo a otro? Techo de menos.',
        '😂 ¿Cuál es el colmo de un jardinero? Que siempre lo dejen plantado.'
      ];

      return interaction.reply({
        embeds: [
          embed(
            '😂 Chiste',
            jokes[Math.floor(Math.random() * jokes.length)]
          )
        ]
      });
    }

    // ───────── COMPLIMENT ─────────

    if (commandName === 'compliment') {

      const compliments = [
        '✨ Tienes una energía increíble.',
        '👑 Eres una gran persona.',
        '🏨 Tu presencia mejora la comunidad.',
        '💎 Eres alguien especial.'
      ];

      return interaction.reply({
        embeds: [
          embed(
            '💎 Cumplido',
            compliments[Math.floor(Math.random() * compliments.length)]
          )
        ]
      });
    }

    // ───────── FORTUNE ─────────

    if (commandName === 'fortune') {

      const fortunes = [
        '✨ Algo interesante podría ocurrir pronto.',
        '👑 Un buen momento puede estar cerca.',
        '🏨 Hoy podría ser un día diferente.',
        '💎 Mantente atento a nuevas oportunidades.'
      ];

      return interaction.reply({
        embeds: [
          embed(
            '🔮 Fortuna',
            fortunes[Math.floor(Math.random() * fortunes.length)]
          )
        ]
      });
    }

    // ───────── CALCULATE ─────────

    if (commandName === 'calculate') {

      const operation =
        interaction.options.getString('operacion');

      if (!/^[0-9+\-*/().%\s]+$/.test(operation)) {
        return interaction.reply({
          content: '❌ Operación no válida.',
          ephemeral: true
        });
      }

      try {

        const result =
          Function(`"use strict"; return (${operation})`)();

        return interaction.reply({
          embeds: [
            embed(
              '🧮 Calculadora',
              `\`${operation}\` = **${result}**`
            )
          ]
        });

      } catch {
        return interaction.reply({
          content: '❌ No pude calcular esa operación.',
          ephemeral: true
        });
      }
    }

    // ───────── TIMESTAMP ─────────

    if (commandName === 'timestamp') {

      const timestamp =
        interaction.options.getInteger('timestamp');

      return interaction.reply({
        embeds: [
          embed(
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

    // ───────── RULES ─────────

    if (commandName === 'rules') {

      return interaction.reply({
        embeds: [
          embed(
            '📜 Reglas',
            `Consulta las reglas completas en <#${CONFIG.channels.rules}>.`
          )
        ]
      });
    }

    // ───────── LINKS ─────────

    if (commandName === 'links') {

      return interaction.reply({
        embeds: [
          embed(
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

    // ───────── STAFF ─────────

    if (commandName === 'staff') {

      return interaction.reply({
        embeds: [
          embed(
            '🛡️ Staff',
            `Consulta la guía del Staff en <#${CONFIG.channels.staffGuide}>.`
          )
        ]
      });
    }

    // ───────── CHANGELOG ─────────

    if (commandName === 'changelog') {

      return interaction.reply({
        embeds: [
          embed(
            '📋 Changelog',
            [
              '### v1.0',
              '✅ Sistema base de King\'s Assistant',
              '✅ Welcome',
              '✅ Leave',
              '✅ AFK',
              '✅ Información del servidor',
              '✅ Comandos de diversión',
              '✅ Comandos de información',
              '✅ Comandos de utilidad'
            ].join('\n')
          )
        ]
      });
    }

  } catch (error) {

    console.error('❌ Error ejecutando comando:', error);

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: '❌ Ocurrió un error ejecutando este comando.',
        ephemeral: true
      }).catch(() => {});
    } else {
      await interaction.reply({
        content: '❌ Ocurrió un error ejecutando este comando.',
        ephemeral: true
      }).catch(() => {});
    }
  }
});

// ═══════════════════════════════════════════════
// 📋 LOGS
// ═══════════════════════════════════════════════

async function getOrCreateLogsChannel(guild) {

  let channel = guild.channels.cache.find(
    c =>
      c.name === '📋・logs' &&
      c.type === ChannelType.GuildText
  );

  if (channel) return channel;

  try {

    channel = await guild.channels.create({
      name: '📋・logs',
      type: ChannelType.GuildText,
      reason: 'Canal de logs de King\'s Assistant'
    });

    console.log(`✅ Canal de logs creado: ${channel.id}`);

    return channel;

  } catch (error) {

    console.error('❌ No se pudo crear el canal de logs.');

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

  const logEmbed = embed(
    title,
    description
  );

  await channel.send({
    embeds: [logEmbed]
  }).catch(() => {});
}

// ═══════════════════════════════════════════════
// 🚀 BOT READY
// ═══════════════════════════════════════════════

client.once('clientReady', async () => {

  console.log('════════════════════════════════════');
  console.log('♛ KING\'S ASSISTANT ♛');
  console.log(`✅ Conectado como ${client.user.tag}`);
  console.log(`🏨 Servidores: ${client.guilds.cache.size}`);
  console.log('════════════════════════════════════');

  const guild =
    client.guilds.cache.get(CONFIG.guildId);

  if (!guild) {

    console.error(
      '❌ No se encontró el servidor configurado.'
    );

    return;
  }

  await getOrCreateLogsChannel(guild);

  await logAction(
    '🚀 Bot iniciado',
    `**King's Assistant** se ha conectado correctamente.\n\nServidor: **${guild.name}**`
  );

  await registerCommands();
});

// ═══════════════════════════════════════════════
// ⚠️ ERRORES
// ═══════════════════════════════════════════════

client.on('error', error => {
  console.error('❌ Error del cliente:', error);
});

process.on('unhandledRejection', error => {
  console.error('❌ Unhandled Rejection:', error);
});

process.on('uncaughtException', error => {
  console.error('❌ Uncaught Exception:', error);
});

// ═══════════════════════════════════════════════
// 🔐 LOGIN
// ═══════════════════════════════════════════════

if (!process.env.DISCORD_TOKEN) {

  console.error(
    '❌ Falta DISCORD_TOKEN en las variables de entorno.'
  );

  process.exit(1);
}

if (!process.env.CLIENT_ID) {

  console.error(
    '❌ Falta CLIENT_ID en las variables de entorno.'
  );

  process.exit(1);
}

if (!process.env.GUILD_ID) {

  console.error(
    '❌ Falta GUILD_ID en las variables de entorno.'
  );

  process.exit(1);
}

client.login(process.env.DISCORD_TOKEN);
