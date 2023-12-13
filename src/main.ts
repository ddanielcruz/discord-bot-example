import 'dotenv/config'
import env from 'env-var'
import { Client, Events, GatewayIntentBits } from 'discord.js'

// Get the token from the environment
const DISCORD_TOKEN = env.get('DISCORD_TOKEN').required().asString()

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] })

// Define event listener for the ready event (called when the client is ready)
client.once(Events.ClientReady, () => {
  console.log('Ready!')
})

// Login to Discord with the client's token
client.login(DISCORD_TOKEN)
