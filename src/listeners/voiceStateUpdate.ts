import Discord from "discord.js"
import { client } from "../index"

client.on("voiceStateUpdate", async (oldState, newState) => {
	if (newState.guild.id === "549503328472530974" && !newState.member?.user.bot) {
		const logs = client.channels.cache.get("591280178873892901") as Discord.TextChannel,
			successColor = "#43B581",
			errorColor = "#FF470F"

		// Give users access to #no-mic
		if (newState.channel && !newState.member!.roles.cache.has("829312419406020608") && newState.channelId !== newState.guild.afkChannelId)
			await newState.member!.roles.add("829312419406020608", "Joined a voice channel") // In Voice
		else if ((!newState.channel || newState.channelId === newState.guild.afkChannelId) && newState.member!.roles.cache.has("829312419406020608"))
			await newState.member!.roles.remove("829312419406020608", "Left a voice channel")

		if (!!oldState.serverMute != !!newState.serverMute) { // Convert to falsey value to prevent null != false from triggering the condition
			const embed = new Discord.MessageEmbed()
				.setColor(newState.serverMute ? errorColor : successColor)
				.setAuthor(newState.member!.user.tag, newState.member!.displayAvatarURL({ format: "png", dynamic: true }))
				.setDescription(`**${newState.member} was server ${newState.serverMute ? "muted" : "unmuted"} in ${newState.channel?.name}**`)
				.setFooter(`ID: ${newState.member!.id}`)
				.setTimestamp()
			await logs.send({ embeds: [embed] })
		} else if (!!oldState.serverDeaf != !!newState.serverDeaf) {
			const embed = new Discord.MessageEmbed()
				.setColor(newState.serverDeaf ? errorColor : successColor)
				.setAuthor(newState.member!.user.tag, newState.member!.displayAvatarURL({ format: "png", dynamic: true }))
				.setDescription(`**${newState.member} was server ${newState.serverDeaf ? "deafened" : "undeafened"} in ${newState.channel?.name}**`)
				.setFooter(`ID: ${newState.member!.id}`)
				.setTimestamp()
			await logs.send({ embeds: [embed] })
		}
	}
})
