import 'dotenv/config'
import env from 'env-var'
import { ChannelType, Client, GatewayIntentBits, TextChannel } from 'discord.js'

const DISCORD_TOKEN = env.get('DISCORD_TOKEN').required().asString()
const DISCORD_GUILD_ID = env.get('DISCORD_GUILD_ID').required().asString()

const client = new Client({ intents: [GatewayIntentBits.Guilds] })

try {
  // Login to Discord with the client's token
  await client.login(DISCORD_TOKEN)

  // Get a random channel from the guild to send a message
  const guild = client.guilds.cache.get(DISCORD_GUILD_ID)
  if (!guild) {
    throw new Error('No guild found')
  }

  const channels = await guild.channels.fetch()
  if (!channels || channels.size === 0) {
    throw new Error('No channels found in guild')
  }

  // Send a test message
  const channel = channels.find(isTextChannel)
  if (!channel) {
    throw new Error('No text channel found in guild')
  }

  await channel.send(`[${Date.now()}] Hello world!`)
} catch (error) {
  console.error(error)
  process.exit(1)
} finally {
  await client.destroy()
}

function isTextChannel(channel: any): channel is TextChannel {
  return channel.type === ChannelType.GuildText
}
