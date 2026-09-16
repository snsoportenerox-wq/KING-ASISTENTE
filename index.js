require('dotenv').config();

const {
  Client,
  GatewayIntentBits,
  Partials,
  EmbedBuilder,
  ChannelType,
  SlashCommandBuilder
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
// ═══════════════════════════════════════════════

const afkUsers = new Map();
const inviteUses = new Map();

// ═══════════════════════════════════════════════
// 🎨 EMBED BASE
// ═══════════════════════════════════════════════

function createEmbed(title, description = '') {
  return new EmbedBuilder()
    .setColor(0xD4AF37)
    .setTitle(title)
    .setDescription(description)
    .setTimestamp();
}

// ═══════════════════════════════════════════════
// 📤 ENVIAR A CANAL
// ═══════════════════════════════════════════════

async function sendToChannel(channelId, message) {
  const channel = client.channels.cache.get(channelId);

  if (!channel) {
    console.log(`❌ Canal no encontrado: ${channelId}`);
    return null;
  }

  try {
    return await channel.send(message);
  } catch (error) {
    console.error(
      `❌ Error enviando al canal ${channelId}:`,
      error.message
    );
    return null;
  }
}

// ═══════════════════════════════════════════════
// 📋 COMANDOS
// ═══════════════════════════════════════════════

const commands = [

  // ═════════════════════════════════════════════
  // 🎉 FUN
  // ═════════════════════════════════════════════

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

  // ═════════════════════════════════════════════
  // ℹ️ INFORMACIÓN
  // ═════════════════════════════════════════════

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

  // ═════════════════════════════════════════════
  // 🛠️ UTILIDAD
  // ═════════════════════════════════════════════

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

async function registerCommands(guild) {

  try {

    console.log('📡 Registrando comandos...');

    const registered =
      await client.application.commands.set(
        commands,
        guild.id
      );

    console.log(
      `✅ ${registered.size} comandos registrados correctamente.`
    );

    return true;

  } catch (error) {

    console.error(
      '❌ ERROR REGISTRANDO COMANDOS'
    );

    console.error(error);

    return false;
  }
}

// ═══════════════════════════════════════════════
// 🛎️ WELCOME
// ═══════════════════════════════════════════════

client.on('guildMemberAdd', async member => {

  console.log(
    `🛎️ Entró: ${member.user.tag}`
  );

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

  await sendToChannel(
    CONFIG.channels.welcome,
    {
      content: `${member}`,
      embeds: [welcomeEmbed],
      allowedMentions: {
        users: [member.id]
      }
    }
  );

  await logAction(
    '🛎️ Nuevo miembro',
    `${member.user.tag} entró al servidor.`
  );
});

// ═══════════════════════════════════════════════
// 🚪 LEAVE
// ═══════════════════════════════════════════════

client.on('guildMemberRemove', async member => {

  console.log(
    `🚪 Salió: ${member.user.tag}`
  );

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

  await sendToChannel(
    CONFIG.channels.leave,
    {
      content: `${member.user}`,
      embeds: [leaveEmbed],
      allowedMentions: {
        users: [member.id]
      }
    }
  );

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

    const invites =
      await member.guild.invites.fetch();

    let usedInvite = null;

    for (const invite of invites.values()) {

      const previousUses =
        inviteUses.get(invite.code) || 0;

      if (
        (invite.uses || 0) >
        previousUses
      ) {
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

    const inviter =
      usedInvite.inviter;

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

  const member =
    interaction.member;

  const reason =
    interaction.options.getString(
      'motivo'
    ) ||
    'Sin motivo especificado';

  if (afkUsers.has(member.id)) {

    return interaction.reply({
      content:
        '💤 Ya tienes el estado AFK activado.',
      ephemeral: true
    });
  }

  const oldNickname =
    member.nickname;

  afkUsers.set(
    member.id,
    {
      reason,
      since: Date.now(),
      oldNickname
    }
  );

  let newNickname =
    `[AFK] ${member.displayName}`;

  if (newNickname.length > 32) {
    newNickname =
      `[AFK] ${member.user.username}`;
  }

  try {

    await member.setNickname(
      newNickname
    );

  } catch {

    console.log(
      '⚠️ No se pudo cambiar el nickname.'
    );
  }

  await interaction.reply({
    embeds: [
      createEmbed(
        '💤 Estado AFK',
        [
          'Has activado tu estado AFK.',
          '',
          `**Motivo:** ${reason}`
        ].join('\n')
      )
    ],
    ephemeral: true
  });
}

async function removeAFK(member) {

  const data =
    afkUsers.get(member.id);

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

  if (
    message.member &&
    afkUsers.has(message.author.id)
  ) {

    await removeAFK(
      message.member
    );

    const response =
      await message.channel.send(
        `🛎️ Bienvenido/a de vuelta, ${message.author}. Tu estado AFK ha sido retirado.`
      );

    setTimeout(() => {
      response.delete().catch(() => {});
    }, 5000);
  }

  for (
    const user of message.mentions.users.values()
  ) {

    const data =
      afkUsers.get(user.id);

    if (!data) continue;

    const minutes =
      Math.floor(
        (Date.now() - data.since) /
        60000
      );

    const afkEmbed =
      createEmbed(
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
      '❌ No se pudo crear el canal de logs:',
      error.message
    );

    return null;
  }
}

async function logAction(
  title,
  description
) {

  const guild =
    client.guilds.cache.get(
      CONFIG.guildId
    );

  if (!guild) return;

  const channel =
    await getOrCreateLogsChannel(
      guild
    );

  if (!channel) return;

  await channel.send({
    embeds: [
      createEmbed(
        title,
        description
      )
    ]
  }).catch(() => {});
}

// ═══════════════════════════════════════════════
// 📜 EMBEDS DE REGLAS
// ═══════════════════════════════════════════════

function rulesEmbeds() {

  return [

    createEmbed(
      '♛ KING THE LAND ♛',
      [
        '📜・**REGLAS OFICIALES**',
        '',
        'Bienvenido/a a las normas oficiales de nuestra comunidad.',
        '',
        'Lee cada apartado antes de participar.',
        '',
        '♛ Respeto, convivencia y seguridad para todos. ♛'
      ].join('\n')
    ),

    createEmbed(
      '📜 01・RESPETO Y CHAT',
      [
        '• Respeta a todos los miembros.',
        '• No se permiten insultos, acoso o discriminación.',
        '• Evita discusiones innecesarias.',
        '• Utiliza cada canal para su propósito.',
        '• No hagas spam ni flood.'
      ].join('\n')
    ),

    createEmbed(
      '📜 02・PUBLICIDAD Y VOZ',
      [
        '• No publiques publicidad sin autorización.',
        '• No envíes invitaciones de otros servidores fuera de los espacios permitidos.',
        '• No molestes, grites o generes conflictos en canales de voz.',
        '• Respeta a quienes estén participando en una conversación.'
      ].join('\n')
    ),

    createEmbed(
      '📜 03・PRIVACIDAD Y CUENTAS',
      [
        '• No compartas información privada de otras personas.',
        '• No publiques datos personales.',
        '• No intentes suplantar a otros usuarios.',
        '• Cada miembro es responsable de su cuenta.'
      ].join('\n')
    ),

    createEmbed(
      '📜 04・BOTS Y STAFF',
      [
        '• Utiliza los bots correctamente.',
        '• No intentes explotar errores o vulnerabilidades.',
        '• Respeta las indicaciones del Staff.',
        '• Si consideras que una sanción fue incorrecta, utiliza el sistema de apelaciones.'
      ].join('\n')
    ),

    createEmbed(
      '📜 05・CONTENIDO NO PERMITIDO',
      [
        '• Contenido ilegal.',
        '• Contenido sexual explícito.',
        '• Amenazas o acoso.',
        '• Material extremadamente violento.',
        '• Estafas, malware o intentos de perjudicar a otros usuarios.'
      ].join('\n')
    )

  ];
}

// ═══════════════════════════════════════════════
// 💰 EMBEDS DE ECONOMÍA
// ═══════════════════════════════════════════════

function economyEmbeds() {

  return [

    createEmbed(
      '♛ KING THE LAND ♛',
      [
        '💰・**ECONOMÍA**',
        '',
        'Sistema informativo de economía de King the Land.',
        '',
        'Aquí encontrarás información sobre la moneda, ahorro, tienda y transferencias.'
      ].join('\n')
    ),

    createEmbed(
      '💰 01・MONEDA',
      [
        'La economía utiliza una moneda virtual dentro de la comunidad.',
        '',
        '💎 La moneda puede utilizarse para diferentes funciones que se habiliten en el servidor.',
        '',
        '⚠️ La moneda virtual no tiene valor monetario real.'
      ].join('\n')
    ),

    createEmbed(
      '💰 02・CÓMO GANAR',
      [
        'Puedes conseguir moneda mediante las actividades que el servidor habilite.',
        '',
        '🎉 Participación',
        '🏨 Actividades',
        '🎟️ Eventos',
        '🤝 Dinámicas de comunidad'
      ].join('\n')
    ),

    createEmbed(
      '💰 03・AHORRO Y TIENDA',
      [
        '🏦 **Ahorro**',
        'Guarda tus monedas para utilizarlas posteriormente.',
        '',
        '🛍️ **Tienda**',
        'La tienda puede ofrecer diferentes artículos o beneficios virtuales.'
      ].join('\n')
    ),

    createEmbed(
      '💰 04・TRANSFERENCIAS Y RANKING',
      [
        '🤝 Las transferencias permiten compartir moneda con otros miembros cuando el sistema esté habilitado.',
        '',
        '🏆 El ranking puede mostrar a los miembros con mayor cantidad de moneda.',
        '',
        '⚠️ No se permite aprovechar errores del sistema.'
      ].join('\n')
    )

  ];
}

// ═══════════════════════════════════════════════
// 🤝 EMBEDS ALLIES & AFFILIATES
// ═══════════════════════════════════════════════

function alliesEmbeds() {

  return [

    createEmbed(
      '♛ KING THE LAND ♛',
      [
        '🤝・**ALLIES & AFFILIATES**',
        '',
        'Espacio dedicado a nuestras alianzas y afiliaciones.',
        '',
        'Construimos relaciones con otras comunidades.'
      ].join('\n')
    ),

    createEmbed(
      '🤝 01・ALLIES',
      [
        'Los **Allies** son comunidades que mantienen una alianza con King the Land.',
        '',
        '📌 Requisito general:',
        '**50 miembros o más.**',
        '',
        'Las solicitudes serán revisadas por el equipo correspondiente.'
      ].join('\n')
    ),

    createEmbed(
      '🤝 02・BENEFICIOS',
      [
        'Los aliados pueden disfrutar de:',
        '',
        '📢 Difusión autorizada',
        '🤝 Colaboraciones',
        '🎉 Actividades conjuntas',
        '🔗 Relación directa entre comunidades'
      ].join('\n')
    ),

    createEmbed(
      '🤝 03・AFFILIATES',
      [
        'Los **Affiliates** son comunidades que forman parte de nuestra red de afiliaciones.',
        '',
        '📌 Requisito general:',
        '**100 miembros o más.**'
      ].join('\n')
    ),

    createEmbed(
      '🤝 04・SOLICITUD',
      [
        'Para solicitar una alianza o afiliación utiliza el canal correspondiente.',
        '',
        '📋 Las solicitudes serán revisadas por el equipo.',
        '',
        '🔗 Solicitud:',
        'https://discord.com/channels/1538681127861227633/1538681130293923896'
      ].join('\n')
    )

  ];
}

// ═══════════════════════════════════════════════
// 🛡️ STAFF GUIDE
// ═══════════════════════════════════════════════

function staffGuideEmbed() {

  return createEmbed(
    '🛡️ STAFF GUIDE',
    [
      '### 🛎️ Staff',
      'Ayudan a los miembros, atienden situaciones y apoyan a la comunidad.',
      '',
      '### 🛡️ Moderación',
      'Mantienen el orden, revisan infracciones y aplican las medidas correspondientes.',
      '',
      '### ⚙️ Administración',
      'Supervisa el servidor y coordina el trabajo del Staff.',
      '',
      '### 👑 Dirección',
      'Supervisa los sistemas y las decisiones importantes.',
      '',
      '### 🤝 Trabajo en equipo',
      'El Staff debe trabajar con respeto, comunicación y responsabilidad.'
    ].join('\n')
  );
}

// ═══════════════════════════════════════════════
// 📜 STAFF RULES
// ═══════════════════════════════════════════════

function staffRulesEmbed() {

  return createEmbed(
    '📜 STAFF RULES',
    [
      '### 01・Respeto',
      'Trata a miembros y compañeros con respeto.',
      '',
      '### 02・Imparcialidad',
      'Las decisiones deben aplicarse de forma justa.',
      '',
      '### 03・Privacidad',
      'La información interna debe mantenerse privada.',
      '',
      '### 04・Uso de permisos',
      'Utiliza tus permisos únicamente para tus funciones.',
      '',
      '### 05・No abuso de poder',
      'Está prohibido utilizar el Staff para beneficio personal.',
      '',
      '### 06・Conflictos',
      'Los conflictos deben manejarse profesionalmente.',
      '',
      '### 07・Responsabilidad',
      'Cada miembro del Staff responde por sus acciones.',
      '',
      '### 08・Dar el ejemplo',
      'El Staff debe representar correctamente los valores de King the Land.'
    ].join('\n')
  );
}

// ═══════════════════════════════════════════════
// 🏨 SERVER INFORMATION — 15 EMBEDS
// ═══════════════════════════════════════════════

function serverInformationEmbeds(guild) {

  return [

    createEmbed(
      '♛ KING THE LAND ♛',
      [
        '🏨・**SERVER INFORMATION**',
        '',
        `Bienvenido a la información oficial de **${guild.name}**.`,
        '',
        'Aquí encontrarás información general de la comunidad.'
      ].join('\n')
    ),

    createEmbed(
      '🏨 02・SOBRE EL SERVIDOR',
      [
        `**Nombre:** ${guild.name}`,
        `**ID:** ${guild.id}`,
        `**Propietario:** <@${guild.ownerId}>`,
        `**Creado:** <t:${Math.floor(guild.createdTimestamp / 1000)}:F>`
      ].join('\n')
    ),

    createEmbed(
      '📜 03・NORMATIVA',
      `Consulta las normas oficiales en <#${CONFIG.channels.rules}>.`
    ),

    createEmbed(
      '🛎️ 04・BIENVENIDA',
      [
        `Los nuevos miembros reciben su bienvenida en <#${CONFIG.channels.welcome}>.`,
        '',
        '🏨 Disfruta tu estancia en King the Land.'
      ].join('\n')
    ),

    createEmbed(
      '🤝 05・COMUNIDAD',
      [
        'King the Land es una comunidad creada para convivir, conocer personas y participar en diferentes actividades.',
        '',
        '🤝 Respeto',
        '🎉 Comunidad',
        '🏨 Eventos',
        '💎 Experiencias'
      ].join('\n')
    ),

    createEmbed(
      '🎉 06・EVENTOS',
      [
        'Aquí se pueden realizar diferentes eventos y actividades.',
        '',
        '🎉 Dinámicas',
        '🏆 Actividades',
        '🎭 Eventos especiales'
      ].join('\n')
    ),

    createEmbed(
      '💎 07・BENEFICIOS',
      [
        'Los miembros pueden disfrutar de diferentes espacios y funciones de la comunidad.',
        '',
        '🏨 Canales',
        '🎉 Eventos',
        '🤝 Comunidad',
        '💎 Beneficios especiales'
      ].join('\n')
    ),

    createEmbed(
      '🎟️ 08・INVITACIONES',
      [
        `Las invitaciones se registran en <#${CONFIG.channels.invites}>.`,
        '',
        'Invita nuevos miembros y ayuda a crecer a la comunidad.'
      ].join('\n')
    ),

    createEmbed(
      '🛡️ 09・STAFF',
      [
        `La guía del Staff se encuentra en <#${CONFIG.channels.staffGuide}>.`,
        '',
        'El equipo está encargado de ayudar y mantener la comunidad organizada.'
      ].join('\n')
    ),

    createEmbed(
      '⚖️ 10・SANCIONES Y APELACIONES',
      [
        'Las sanciones se aplican cuando se incumplen las normas.',
        '',
        `⚖️ Apelaciones: <#${CONFIG.channels.appeals}>`,
        `🔗 Servidor de apelaciones: ${CONFIG.appealServer}`
      ].join('\n')
    ),

    createEmbed(
      '💤 11・AFK',
      [
        'Puedes utilizar el sistema AFK para indicar que estarás ausente.',
        '',
        '`/afk [motivo]`'
      ].join('\n')
    ),

    createEmbed(
      '📢 12・ANUNCIOS',
      [
        'Los anuncios importantes de King the Land se publican en los canales correspondientes.',
        '',
        '📢 Mantente atento a las novedades y actualizaciones.'
      ].join('\n')
    ),

    createEmbed(
      '🔗 13・ENLACES IMPORTANTES',
      [
        `📜 Reglas: <#${CONFIG.channels.rules}>`,
        `🏨 Información: <#${CONFIG.channels.serverInfo}>`,
        `⚖️ Apelaciones: <#${CONFIG.channels.appeals}>`,
        `🎟️ Invitaciones: <#${CONFIG.channels.invites}>`,
        '',
        `⚖️ Apelaciones externas: ${CONFIG.appealServer}`
      ].join('\n')
    ),

    createEmbed(
      '🛡️ 14・STAFF & CONTACTO',
      [
        `Consulta la guía en <#${CONFIG.channels.staffGuide}>.`,
        '',
        'Si necesitas ayuda, utiliza los canales destinados para soporte.'
      ].join('\n')
    ),

    createEmbed(
      '🚪 15・CHECK-OUT',
      [
        `El sistema de salida utiliza <#${CONFIG.channels.leave}>.`,
        '',
        '🏨 Gracias por formar parte de King the Land.',
        '',
        '♛ Esperamos volver a recibirte. ♛'
      ].join('\n')
    )

  ];
}

// ═══════════════════════════════════════════════
// 📌 PUBLICADOR DE EMBEDS
// ═══════════════════════════════════════════════

async function publishIfMissing(
  channelId,
  embeds,
  name
) {

  const channel =
    client.channels.cache.get(
      channelId
    );

  if (!channel) {

    console.log(
      `❌ ${name}: canal no encontrado (${channelId})`
    );

    return;
  }

  try {

    const messages =
      await channel.messages.fetch({
        limit: 100
      });

    const botMessages =
      messages.filter(
        message =>
          message.author.id === client.user.id &&
          message.embeds.length > 0
      );

    if (botMessages.size > 0) {

      console.log(
        `⏭️ ${name}: ya existe, no se duplica.`
      );

      return;
    }

    // Discord permite máximo 10 embeds por mensaje.
    for (
      let i = 0;
      i < embeds.length;
      i += 10
    ) {

      const chunk =
        embeds.slice(i, i + 10);

      await channel.send({
        embeds: chunk
      });
    }

    console.log(
      `✅ ${name}: ${embeds.length} embed(s) enviados.`
    );

  } catch (error) {

    console.error(
      `❌ ${name}:`,
      error.message
    );
  }
}

// ═══════════════════════════════════════════════
// 📚 PUBLICAR TODAS LAS GUÍAS
// ═══════════════════════════════════════════════

async function publishAllGuides(guild) {

  console.log('');
  console.log('════════════════════════════════════');
  console.log('📚 PUBLICANDO GUÍAS Y EMBEDS');
  console.log('════════════════════════════════════');

  await publishIfMissing(
    CONFIG.channels.rules,
    rulesEmbeds(),
    '📜 Reglas'
  );

  await publishIfMissing(
    CONFIG.channels.economy,
    economyEmbeds(),
    '💰 Economía'
  );

  await publishIfMissing(
    CONFIG.channels.allies,
    alliesEmbeds(),
    '🤝 Allies & Affiliates'
  );

  await publishIfMissing(
    CONFIG.channels.staffGuide,
    [staffGuideEmbed()],
    '🛡️ Staff Guide'
  );

  await publishIfMissing(
    CONFIG.channels.staffRules,
    [staffRulesEmbed()],
    '📜 Staff Rules'
  );

  await publishIfMissing(
    CONFIG.channels.serverInfo,
    serverInformationEmbeds(guild),
    '🏨 Server Information'
  );

  console.log('════════════════════════════════════');
  console.log('📚 FINALIZÓ LA PUBLICACIÓN');
  console.log('════════════════════════════════════');
  console.log('');
}

// ═══════════════════════════════════════════════
// 🧩 INTERACCIONES
// ═══════════════════════════════════════════════

client.on(
  'interactionCreate',
  async interaction => {

    if (!interaction.isChatInputCommand()) {
      return;
    }

    try {

      // ═════════════════════════════════════════
      // 💤 AFK
      // ═════════════════════════════════════════

      if (
        interaction.commandName === 'afk'
      ) {
        return activateAFK(
          interaction
        );
      }

      // ═════════════════════════════════════════
      // 🏓 PING
      // ═════════════════════════════════════════

      if (
        interaction.commandName === 'ping'
      ) {

        return interaction.reply({
          embeds: [
            createEmbed(
              '🏓 PONG',
              `Latencia: **${client.ws.ping}ms**`
            )
          ]
        });
      }

      // ═════════════════════════════════════════
      // ⏱️ UPTIME
      // ═════════════════════════════════════════

      if (
        interaction.commandName === 'uptime'
      ) {

        const total =
          Math.floor(
            process.uptime()
          );

        const days =
          Math.floor(
            total / 86400
          );

        const hours =
          Math.floor(
            (total % 86400) / 3600
          );

        const minutes =
          Math.floor(
            (total % 3600) / 60
          );

        const seconds =
          total % 60;

        return interaction.reply({
          embeds: [
            createEmbed(
              '⏱️ UPTIME',
              `**${days}d ${hours}h ${minutes}m ${seconds}s**`
            )
          ]
        });
      }

      // ═════════════════════════════════════════
      // 🤖 BOTINFO
      // ═════════════════════════════════════════

      if (
        interaction.commandName === 'botinfo'
      ) {

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

      // ═════════════════════════════════════════
      // 🟢 STATUS
      // ═════════════════════════════════════════

      if (
        interaction.commandName === 'status'
      ) {

        return interaction.reply({
          embeds: [
            createEmbed(
              '🟢 ESTADO',
              [
                "**King's Assistant está operativo.**",
                '',
                '📡 Discord: Conectado',
                '🏨 Servidor: Conectado',
                `📶 Ping: ${client.ws.ping}ms`
              ].join('\n')
            )
          ]
        });
      }

      // ═════════════════════════════════════════
      // 📊 STATS
      // ═════════════════════════════════════════

      if (
        interaction.commandName === 'stats'
      ) {

        return interaction.reply({
          embeds: [
            createEmbed(
              '📊 ESTADÍSTICAS',
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

      // ═════════════════════════════════════════
      // 🏨 SERVERINFO
      // ═════════════════════════════════════════

      if (
        interaction.commandName === 'serverinfo'
      ) {

        const guild =
          interaction.guild;

        const textChannels =
          guild.channels.cache.filter(
            c =>
              c.type === ChannelType.GuildText
          ).size;

        const voiceChannels =
          guild.channels.cache.filter(
            c =>
              c.type === ChannelType.GuildVoice
          ).size;

        const categories =
          guild.channels.cache.filter(
            c =>
              c.type === ChannelType.GuildCategory
          ).size;

        const bots =
          guild.members.cache.filter(
            m => m.user.bot
          ).size;

        const users =
          Math.max(
            0,
            guild.memberCount - bots
          );

        const boosters =
          guild.members.cache.filter(
            m => m.premiumSince
          ).size;

        return interaction.reply({
          embeds: [
            createEmbed(
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
                `**Canales:** ${guild.channels.cache.size}`,
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
                '♛ King the Land ♛'
              ].join('\n')
            )
          ]
        });
      }

      // ═════════════════════════════════════════
      // 👥 MEMBERCOUNT
      // ═════════════════════════════════════════

      if (
        interaction.commandName === 'membercount'
      ) {

        return interaction.reply({
          embeds: [
            createEmbed(
              '👥 MIEMBROS',
              `King the Land tiene **${interaction.guild.memberCount} miembros**.`
            )
          ]
        });
      }

      // ═════════════════════════════════════════
      // 💎 BOOSTERS
      // ═════════════════════════════════════════

      if (
        interaction.commandName === 'boosters'
      ) {

        const boosters =
          interaction.guild.members.cache
            .filter(
              m => m.premiumSince
            )
            .map(
              m => m.user
            );

        return interaction.reply({
          embeds: [
            createEmbed(
              '💎 BOOSTERS',
              boosters.length
                ? boosters
                    .map(
                      user =>
                        `💎 ${user}`
                    )
                    .join('\n')
                : 'Actualmente no hay boosters visibles.'
            )
          ]
        });
      }

      // ═════════════════════════════════════════
      // 👤 USERINFO
      // ═════════════════════════════════════════

      if (
        interaction.commandName === 'userinfo'
      ) {

        const user =
          interaction.options.getUser(
            'usuario'
          ) ||
          interaction.user;

        const member =
          interaction.guild.members.cache.get(
            user.id
          );

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
              ]
                .filter(Boolean)
                .join('\n')
            ).setThumbnail(
              user.displayAvatarURL({
                dynamic: true
              })
            )
          ]
        });
      }

      // ═════════════════════════════════════════
      // 🖼️ AVATAR
      // ═════════════════════════════════════════

      if (
        interaction.commandName === 'avatar'
      ) {

        const user =
          interaction.options.getUser(
            'usuario'
          ) ||
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

      // ═════════════════════════════════════════
      // 🎭 ROLEINFO
      // ═════════════════════════════════════════

      if (
        interaction.commandName === 'roleinfo'
      ) {

        const role =
          interaction.options.getRole(
            'rol'
          );

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

      // ═════════════════════════════════════════
      // 📁 CHANNELINFO
      // ═════════════════════════════════════════

      if (
        interaction.commandName === 'channelinfo'
      ) {

        const channel =
          interaction.options.getChannel(
            'canal'
          ) ||
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

      // ═════════════════════════════════════════
      // 🏨 SERVERICON
      // ═════════════════════════════════════════

      if (
        interaction.commandName === 'servericon'
      ) {

        const icon =
          interaction.guild.iconURL({
            size: 1024,
            extension: 'png'
          });

        const embed =
          createEmbed(
            '🏨 ICONO DEL SERVIDOR',
            icon
              ? `[Abrir icono](${icon})`
              : 'El servidor no tiene icono.'
          );

        if (icon) {
          embed.setImage(icon);
        }

        return interaction.reply({
          embeds: [embed]
        });
      }

      // ═════════════════════════════════════════
      // 🖼️ SERVERBANNER
      // ═════════════════════════════════════════

      if (
        interaction.commandName === 'serverbanner'
      ) {

        const banner =
          interaction.guild.bannerURL({
            size: 2048,
            extension: 'png'
          });

        const embed =
          createEmbed(
            '🖼️ BANNER DEL SERVIDOR',
            banner
              ? `[Abrir banner](${banner})`
              : 'El servidor no tiene banner disponible.'
          );

        if (banner) {
          embed.setImage(banner);
        }

        return interaction.reply({
          embeds: [embed]
        });
      }

      // ═════════════════════════════════════════
      // 📅 JOINED
      // ═════════════════════════════════════════

      if (
        interaction.commandName === 'joined'
      ) {

        const user =
          interaction.options.getUser(
            'usuario'
          ) ||
          interaction.user;

        const member =
          await interaction.guild.members.fetch(
            user.id
          );

        return interaction.reply({
          embeds: [
            createEmbed(
              '📅 ENTRADA AL SERVIDOR',
              `${user} entró el <t:${Math.floor(member.joinedTimestamp / 1000)}:F>`
            )
          ]
        });
      }

      // ═════════════════════════════════════════
      // 🎭 ROLES
      // ═════════════════════════════════════════

      if (
        interaction.commandName === 'roles'
      ) {

        const roles =
          interaction.guild.roles.cache
            .filter(
              role =>
                role.id !== interaction.guild.id
            )
            .sort(
              (a, b) =>
                b.position - a.position
            )
            .map(
              role =>
                role.toString()
            )
            .slice(0, 50);

        return interaction.reply({
          embeds: [
            createEmbed(
              '🎭 ROLES',
              roles.length
                ? roles.join('\n')
                : 'No hay roles.'
            )
          ]
        });
      }

      // ═════════════════════════════════════════
      // 🛡️ STAFF
      // ═════════════════════════════════════════

      if (
        interaction.commandName === 'staff'
      ) {

        return interaction.reply({
          embeds: [
            createEmbed(
              '🛡️ STAFF',
              `Consulta la guía del Staff en <#${CONFIG.channels.staffGuide}>.`
            )
          ]
        });
      }

      // ═════════════════════════════════════════
      // 📜 RULES
      // ═════════════════════════════════════════

      if (
        interaction.commandName === 'rules'
      ) {

        return interaction.reply({
          embeds: [
            createEmbed(
              '📜 REGLAS',
              `Consulta las reglas oficiales en <#${CONFIG.channels.rules}>.`
            )
          ]
        });
      }

      // ═════════════════════════════════════════
      // 🔗 LINKS
      // ═════════════════════════════════════════

      if (
        interaction.commandName === 'links'
      ) {

        return interaction.reply({
          embeds: [
            createEmbed(
              '🔗 ENLACES IMPORTANTES',
              [
                `📜 Reglas: <#${CONFIG.channels.rules}>`,
                `🏨 Información: <#${CONFIG.channels.serverInfo}>`,
                `⚖️ Apelaciones: <#${CONFIG.channels.appeals}>`,
                `🎟️ Invitaciones: <#${CONFIG.channels.invites}>`,
                '',
                `⚖️ Servidor de apelaciones: ${CONFIG.appealServer}`
              ].join('\n')
            )
          ]
        });
      }

      // ═════════════════════════════════════════
      // 📋 CHANGELOG
      // ═════════════════════════════════════════

      if (
        interaction.commandName === 'changelog'
      ) {

        return interaction.reply({
          embeds: [
            createEmbed(
              '📋 CHANGELOG',
              [
                '### v1.0',
                '✅ Sistema base',
                '✅ Welcome',
                '✅ Leave',
                '✅ AFK',
                '✅ Invitaciones',
                '✅ Logs',
                '✅ Guías automáticas',
                '✅ Comandos Fun',
                '✅ Comandos Information',
                '✅ Comandos Utility'
              ].join('\n')
            )
          ]
        });
      }

      // ═════════════════════════════════════════
      // 🎱 8BALL
      // ═════════════════════════════════════════

      if (
        interaction.commandName === '8ball'
      ) {

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
          interaction.options.getString(
            'pregunta'
          );

        const answer =
          answers[
            Math.floor(
              Math.random() *
              answers.length
            )
          ];

        return interaction.reply({
          embeds: [
            createEmbed(
              '🎱 8BALL',
              [
                `**Pregunta:** ${question}`,
                '',
                `**Respuesta:** ${answer}`
              ].join('\n')
            )
          ]
        });
      }

      // ═════════════════════════════════════════
      // 🪙 COINFLIP
      // ═════════════════════════════════════════

      if (
        interaction.commandName === 'coinflip'
      ) {

        const result =
          Math.random() < 0.5
            ? 'Cara'
            : 'Cruz';

        return interaction.reply({
          embeds: [
            createEmbed(
              '🪙 MONEDA',
              `Resultado: **${result}**`
            )
          ]
        });
      }

      // ═════════════════════════════════════════
      // 🎲 DICE
      // ═════════════════════════════════════════

      if (
        interaction.commandName === 'dice'
      ) {

        const result =
          Math.floor(
            Math.random() * 6
          ) + 1;

        return interaction.reply({
          embeds: [
            createEmbed(
              '🎲 DADO',
              `Resultado: **${result}**`
            )
          ]
        });
      }

      // ═════════════════════════════════════════
      // 🎯 CHOOSE
      // ═════════════════════════════════════════

      if (
        interaction.commandName === 'choose'
      ) {

        const options =
          interaction.options
            .getString(
              'opciones'
            )
            .split(',')
            .map(
              x => x.trim()
            )
            .filter(Boolean);

        if (!options.length) {

          return interaction.reply({
            content:
              '❌ No proporcionaste opciones.',
            ephemeral: true
          });
        }

        const selected =
          options[
            Math.floor(
              Math.random() *
              options.length
            )
          ];

        return interaction.reply({
          embeds: [
            createEmbed(
              '🎯 ELECCIÓN',
              `👑 Elegí: **${selected}**`
            )
          ]
        });
      }

      // ═════════════════════════════════════════
      // 🎲 RANDOM
      // ═════════════════════════════════════════

      if (
        interaction.commandName === 'random'
      ) {

        const max =
          interaction.options.getInteger(
            'maximo'
          );

        const result =
          Math.floor(
            Math.random() * max
          ) + 1;

        return interaction.reply({
          embeds: [
            createEmbed(
              '🎲 NÚMERO ALEATORIO',
              `Resultado: **${result}**`
            )
          ]
        });
      }

      // ═════════════════════════════════════════
      // ✊ RPS
      // ═════════════════════════════════════════

      if (
        interaction.commandName === 'rps'
      ) {

        const userChoice =
          interaction.options.getString(
            'eleccion'
          );

        const choices = [
          'piedra',
          'papel',
          'tijera'
        ];

        const botChoice =
          choices[
            Math.floor(
              Math.random() *
              choices.length
            )
          ];

        let result;

        if (
          userChoice === botChoice
        ) {

          result =
            '🤝 Empate.';

        } else if (
          (
            userChoice === 'piedra' &&
            botChoice === 'tijera'
          ) ||
          (
            userChoice === 'papel' &&
            botChoice === 'piedra'
          ) ||
          (
            userChoice === 'tijera' &&
            botChoice === 'papel'
          )
        ) {

          result =
            '👑 Ganaste.';

        } else {

          result =
            '🎭 Esta ronda la gano yo.';
        }

        return interaction.reply({
          embeds: [
            createEmbed(
              '✊ PIEDRA, PAPEL O TIJERA',
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

      // ═════════════════════════════════════════
      // 🤔 WYR
      // ═════════════════════════════════════════

      if (
        interaction.commandName === 'wyr'
      ) {

        const questions = [
          '¿Qué prefieres: viajar al pasado o al futuro?',
          '¿Qué prefieres: tener suerte o talento?',
          '¿Qué prefieres: vivir en la ciudad o en el campo?',
          '¿Qué prefieres: tener mucho tiempo o mucho dinero?'
        ];

        const question =
          questions[
            Math.floor(
              Math.random() *
              questions.length
            )
          ];

        return interaction.reply({
          embeds: [
            createEmbed(
              '🤔 ¿QUÉ PREFIERES?',
              question
            )
          ]
        });
      }

      // ═════════════════════════════════════════
      // 😂 JOKE
      // ═════════════════════════════════════════

      if (
        interaction.commandName === 'joke'
      ) {

        const jokes = [
          '😂 ¿Qué hace una abeja en el gimnasio? ¡Zum-ba!',
          '😂 ¿Qué le dijo un techo a otro? Techo de menos.',
          '😂 ¿Cuál es el colmo de un jardinero? Que lo dejen plantado.'
        ];

        const joke =
          jokes[
            Math.floor(
              Math.random() *
              jokes.length
            )
          ];

        return interaction.reply({
          embeds: [
            createEmbed(
              '😂 CHISTE',
              joke
            )
          ]
        });
      }

      // ═════════════════════════════════════════
      // 💎 COMPLIMENT
      // ═════════════════════════════════════════

      if (
        interaction.commandName === 'compliment'
      ) {

        const compliments = [
          '✨ Tienes una energía increíble.',
          '👑 Tu presencia mejora la comunidad.',
          '💎 Eres alguien especial.',
          '🏨 Siempre eres bienvenido/a aquí.'
        ];

        return interaction.reply({
          embeds: [
            createEmbed(
              '💎 CUMPLIDO',
              compliments[
                Math.floor(
                  Math.random() *
                  compliments.length
                )
              ]
            )
          ]
        });
      }

      // ═════════════════════════════════════════
      // 🔮 FORTUNE
      // ═════════════════════════════════════════

      if (
        interaction.commandName === 'fortune'
      ) {

        const fortunes = [
          '✨ Algo interesante podría ocurrir pronto.',
          '👑 Un buen momento puede estar cerca.',
          '🏨 Hoy podría ser un día diferente.',
          '💎 Mantente atento a nuevas oportunidades.'
        ];

        return interaction.reply({
          embeds: [
            createEmbed(
              '🔮 FORTUNA',
              fortunes[
                Math.floor(
                  Math.random() *
                  fortunes.length
                )
              ]
            )
          ]
        });
      }

      // ═════════════════════════════════════════
      // 🧮 CALCULATE
      // ═════════════════════════════════════════

      if (
        interaction.commandName === 'calculate'
      ) {

        const operation =
          interaction.options.getString(
            'operacion'
          );

        if (
          !/^[0-9+\-*/().%\s]+$/.test(
            operation
          )
        ) {

          return interaction.reply({
            content:
              '❌ Operación no válida.',
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
                '🧮 CALCULADORA',
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

      // ═════════════════════════════════════════
      // ⏰ TIMESTAMP
      // ═════════════════════════════════════════

      if (
        interaction.commandName === 'timestamp'
      ) {

        const timestamp =
          interaction.options.getInteger(
            'timestamp'
          );

        return interaction.reply({
          embeds: [
            createEmbed(
              '⏰ TIMESTAMP',
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

      // ═════════════════════════════════════════
      // ❓ HELP
      // ═════════════════════════════════════════

      if (
        interaction.commandName === 'help'
      ) {

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
                '`/help` `/serverinfo` `/userinfo`',
                '`/roleinfo` `/channelinfo` `/avatar`',
                '`/membercount` `/boosters` `/staff`',
                '`/rules` `/links` `/servericon`',
                '`/serverbanner` `/joined` `/roles`',
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
  }
);

// ═══════════════════════════════════════════════
// 🚀 READY
// ═══════════════════════════════════════════════

client.once(
  'clientReady',
  async () => {

    console.log('');
    console.log('════════════════════════════════════');
    console.log("♛ KING'S ASSISTANT ♛");
    console.log('════════════════════════════════════');

    console.log(
      `✅ Conectado como ${client.user.tag}`
    );

    console.log(
      `🏨 Servidores: ${client.guilds.cache.size}`
    );

    const guild =
      client.guilds.cache.get(
        CONFIG.guildId
      );

    if (!guild) {

      console.error(
        '❌ NO SE ENCONTRÓ EL SERVIDOR.'
      );

      console.error(
        `GUILD_ID utilizado: ${CONFIG.guildId}`
      );

      return;
    }

    console.log(
      `🏨 Servidor encontrado: ${guild.name}`
    );

    // LOGS
    await getOrCreateLogsChannel(
      guild
    );

    // COMANDOS
    const commandsOK =
      await registerCommands(
        guild
      );

    if (!commandsOK) {

      console.error(
        '❌ Los comandos NO pudieron registrarse.'
      );

    } else {

      console.log(
        '🟢 Registro de comandos completado.'
      );
    }

    // EMBEDS
    await publishAllGuides(
      guild
    );

    await logAction(
      '🚀 Bot iniciado',
      [
        `**King's Assistant** se conectó correctamente.`,
        '',
        `🏨 Servidor: **${guild.name}**`,
        `⚙️ Comandos: **${commands.length}**`
      ].join('\n')
    );

    console.log('');
    console.log('════════════════════════════════════');
    console.log('🟢 KING\'S ASSISTANT LISTO');
    console.log('════════════════════════════════════');
  }
);

// ═══════════════════════════════════════════════
// ⚠️ ERRORES
// ═══════════════════════════════════════════════

client.on(
  'error',
  error => {

    console.error(
      '❌ Error del cliente:',
      error
    );
  }
);

process.on(
  'unhandledRejection',
  error => {

    console.error(
      '❌ Unhandled Rejection:',
      error
    );
  }
);

process.on(
  'uncaughtException',
  error => {

    console.error(
      '❌ Uncaught Exception:',
      error
    );
  }
);

// ═══════════════════════════════════════════════
// 🔐 VARIABLES
// ═══════════════════════════════════════════════

if (
  !process.env.DISCORD_TOKEN
) {

  console.error(
    '❌ Falta DISCORD_TOKEN.'
  );

  process.exit(1);
}

if (
  !process.env.CLIENT_ID
) {

  console.error(
    '❌ Falta CLIENT_ID.'
  );

  process.exit(1);
}

if (
  !process.env.GUILD_ID
) {

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
