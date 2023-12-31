import { SlashCommandBuilder, type CommandInteraction } from 'discord.js'

export const data = new SlashCommandBuilder()
  .setName('user')
  .setDescription('Replies with user info!')

export async function execute(interaction: CommandInteraction) {
  // interaction.user is the object representing the User who ran the command
  // interaction.member is the GuildMember object, which represents the user in the specific guild
  await interaction.reply(`This command was run by ${interaction.user.username}`)
}
