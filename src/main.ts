import 'dotenv/config'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import env from 'env-var'
import {
  Client,
  Collection,
  Events,
  GatewayIntentBits,
  type CommandInteraction,
  type SlashCommandBuilder
} from 'discord.js'

export interface Command {
  data: SlashCommandBuilder
  execute: (interaction: CommandInteraction) => Promise<void>
}

interface ClientWithCommands extends Client {
  commands: Collection<string, Command>
}

// Get the token from the environment
const DISCORD_TOKEN = env.get('DISCORD_TOKEN').required().asString()

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] }) as ClientWithCommands
client.commands = new Collection<string, Command>()

// Read the commands directory
const dirName = path.dirname(fileURLToPath(import.meta.url))
const foldersPath = path.join(dirName, 'commands')
const commandFolders = await fs.readdir(foldersPath)

// Attach the commands to the client
for (const folder of commandFolders) {
  const commandsPath = path.join(foldersPath, folder)
  const commandFiles = (await fs.readdir(commandsPath)).filter(file => file.endsWith('.ts'))

  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file)
    const command = await import(filePath)

    // Set a new item in the Collection with the key as the command name and the value as the exported module
    if (isCommand(command)) {
      client.commands.set(command.data.name, command)
    } else {
      console.log(
        `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
      )
    }
  }
}

// Define event listener for the ready event (called when the client is ready)
client.once(Events.ClientReady, () => {
  console.log('Ready!')
})

// Define event listener for the interactionCreate event (called when a user uses a slash command)
client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return

  const client = interaction.client as ClientWithCommands
  const command = client.commands.get(interaction.commandName)

  if (!command) {
    console.error(`No command matching ${interaction.commandName} was found.`)
    return
  }

  try {
    await command.execute(interaction)
  } catch (error) {
    console.error(error)
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: 'There was an error while executing this command!',
        ephemeral: true
      })
    } else {
      await interaction.reply({
        content: 'There was an error while executing this command!',
        ephemeral: true
      })
    }
  }
})

// Login to Discord with the client's token
client.login(DISCORD_TOKEN)

export function isCommand(obj: any): obj is Command {
  return obj && 'data' in obj && 'execute' in obj
}
