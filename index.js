require('dotenv').config();

const {
  Client,
  GatewayIntentBits,
  Partials,
  EmbedBuilder,
  PermissionsBitField,
  ChannelType
} = require('discord.js');

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
// ♛ KING'S ASSISTANT — CONFIGURACIÓN
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

  roles: {
    // Aquí añadiremos los roles cuando los definamos.
  },

  appealServer: 'https://discord.gg/HXKYDk6RGD'
};

// ═══════════════════════════════════════════════
// 📝 FUNCIONES GENERALES
// ═══════════════════════════════════════════════

function createEmbed(title, description) {
  return new EmbedBuilder()
    .setTitle(title)
    .setDescription(description)
    .setColor(0xD4AF37)
    .setTimestamp();
}

async function sendToChannel(channelId, message) {
  const channel = client.channels.cache.get(channelId);

  if (!channel) {
    console.log(`⚠️ Canal no encontrado: ${channelId}`);
    return;
  }

  try {
    await channel.send(message);
  } catch (error) {
    console.error(`❌ Error enviando al canal ${channelId}:`, error);
  }
}

// ═══════════════════════════════════════════════
// 🚀 BOT LISTO
// ═══════════════════════════════════════════════

client.once('ready', async () => {
  console.log('════════════════════════════════════');
  console.log('♛ KING\'S ASSISTANT ♛');
  console.log(`✅ Conectado como ${client.user.tag}`);
  console.log(`🏨 Servidores: ${client.guilds.cache.size}`);
  console.log('════════════════════════════════════');

  const guild = client.guilds.cache.get(CONFIG.guildId);

  if (!guild) {
    console.log('❌ No se encontró el servidor configurado.');
    return;
  }

  // Aquí posteriormente:
  // - Crearemos/comprobaremos el canal de logs.
  // - Cargaremos los sistemas.
  // - Registraremos los comandos.
  // - Comprobaremos las configuraciones.
});

// ═══════════════════════════════════════════════
// 🛎️ MIEMBRO ENTRA
// ═══════════════════════════════════════════════

client.on('guildMemberAdd', async member => {
  console.log(`🛎️ Nuevo miembro: ${member.user.tag}`);

  // El embed completo de bienvenida se añadirá aquí.
});

// ═══════════════════════════════════════════════
// 🚪 MIEMBRO SALE
// ═══════════════════════════════════════════════

client.on('guildMemberRemove', async member => {
  console.log(`🚪 Miembro salió: ${member.user.tag}`);

  // El embed completo de despedida se añadirá aquí.
});

// ═══════════════════════════════════════════════
// 💬 MENSAJES
// ═══════════════════════════════════════════════

client.on('messageCreate', async message => {
  if (message.author.bot) return;

  // Aquí irá:
  // - Detección de menciones AFK
  // - Quitar AFK cuando vuelva a escribir
  // - Sistemas automáticos
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
// 🔑 LOGIN
// ═══════════════════════════════════════════════

if (!process.env.DISCORD_TOKEN) {
  console.error('❌ Falta DISCORD_TOKEN en el archivo .env');
  process.exit(1);
}

client.login(process.env.DISCORD_TOKEN);
