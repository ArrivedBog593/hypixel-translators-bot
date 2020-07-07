const fs = require("fs");
const Discord = require("discord.js");
const { prefix, token, allowed1, allowed2, allowed3, workingColor, errorColor, successColor, neutralColor, listenStatuses, watchStatuses } = require("./config.json");

const client = new Discord.Client();
client.commands = new Discord.Collection();

const commandFiles = fs
  .readdirSync("./commands")
  .filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
}

const cooldowns = new Discord.Collection();

client.once("ready", () => {
  console.log("Ready!");
  var used1 = false;
  client.user.setStatus("online").catch(console.error);
  setInterval(() => {
    if (used1) {
      client.user.setActivity(listenStatuses[Math.floor(Math.random() * listenStatuses.length)], {
        type: "LISTENING"
      });
      used1 = false;
    } else {
      client.user.setActivity(watchStatuses[Math.floor(Math.random() * watchStatuses.length)], {
        type: "WATCHING"
      });
      used1 = true;
    }
  }, 20000);
});

client.on("message", message => {
  if (message.channel.id == allowed1 || message.channel.id == allowed2 || message.channel.id == allowed3 || message.content.startsWith("+mention")) {
    if (message.channel.parent.id != "549503328472530975" && message.channel.parent.id != "569178590697095168") {
      if (!message.content.startsWith(prefix) || message.author.bot) return;

      const args = message.content.slice(prefix.length).split(/ +/);
      const commandName = args.shift().toLowerCase();

      const command =
        client.commands.get(commandName) ||
        client.commands.find(
          cmd => cmd.aliases && cmd.aliases.includes(commandName)
        );

      if (!command) return;

      if (command.guildOnly && message.channel.type !== "text") {
        return message.channel.send(
          "You can't use this command in private messages."
        );
      }

      if (command.args && !args.length) {
        let reply = `You didn't leave any arguments, ${message.author}!`;

        if (command.usage) {
          reply += `\nYou should use this command like this: \`${prefix}${command.usage}\``;
        }

        return message.channel.send(reply);
      }

      if (!cooldowns.has(command.name)) {
        if (message.member.hasPermission("ADMINISTRATOR"))
          if (command.args && args.length < 2) { } else {
            cooldowns.set(command.name, new Discord.Collection());
          }
      }

      const now = Date.now();
      const timestamps = cooldowns.get(command.name);
      const cooldownAmount = (command.cooldown || 3) * 1000;

      if (timestamps.has(message.author.id)) {
        const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

        if (now < expirationTime) {
          const timeLeft = (expirationTime - now) / 1000;
          return message.channel.send(
            `Wait another ${timeLeft.toFixed(1)} second(s) before you use \`${
            command.name
            }\` again.`
          );
        }
      }

      timestamps.set(message.author.id, now);
      setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

      try {
        command.execute(message, args);
      } catch (error) {
        console.error(error);
        const embed = new Discord.MessageEmbed()
          .setColor(errorColor)
          .setTitle("Error")
          .setDescription("Something has gone wrong. Have you entered the command correctly?")
          .addFields({ name: "Command usage", value: `\`${prefix}${command.usage}\`` })
          .setFooter("Executed by " + message.author.tag);
        message.channel.send(embed)

      }
    }
  }
});

client.login(token);
