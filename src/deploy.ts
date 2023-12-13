import 'dotenv/config'
import { REST, type RESTPostAPIChatInputApplicationCommandsJSONBody, Routes } from 'discord.js'
import env from 'env-var'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { isCommand } from './main'

const DISCORD_TOKEN = env.get('DISCORD_TOKEN').required().asString()
const DISCORD_CLIENT_ID = env.get('DISCORD_CLIENT_ID').required().asString()
const DISCORD_GUILD_ID = env.get('DISCORD_GUILD_ID').required().asString()

// Grab all the command folders from the commands directory created earlier
const commands: RESTPostAPIChatInputApplicationCommandsJSONBody[] = []
const dirName = path.dirname(fileURLToPath(import.meta.url))
const foldersPath = path.join(dirName, 'commands')
const commandFolders = await fs.readdir(foldersPath)

for (const folder of commandFolders) {
  const commandsPath = path.join(foldersPath, folder)
  const commandFiles = (await fs.readdir(commandsPath)).filter(file => file.endsWith('.ts'))

  // Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file)
    const command = await import(filePath)
    if (isCommand(command)) {
      commands.push(command.data.toJSON())
    } else {
      console.log(
        `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
      )
    }
  }
}

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(DISCORD_TOKEN)

// Deploy the commands
try {
  console.log(`Started refreshing ${commands.length} application (/) commands.`)

  // The put method is used to fully refresh all commands in the guild with the current set
  const data = (await rest.put(
    Routes.applicationGuildCommands(DISCORD_CLIENT_ID, DISCORD_GUILD_ID),
    {
      body: commands
    }
  )) as unknown as Array<unknown>

  console.log(`Successfully reloaded ${data?.length} application (/) commands.`)
} catch (error) {
  // And of course, make sure you catch and log any errors!
  console.error(error)
}
