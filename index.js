const Discord = require("discord.js")
const client = new Discord.Client()
client.login("token")
const music = require("./music")

var prefisso = "$"

client.on("ready", () => {
    console.log("online")
    client.user.setActivity("$help", { type: "LISTENING" })
})

client.on("message", async (message) => {
    try {
    if(message.author.bot) return
    if(message.content == prefisso + "credits"){
        var embed = new Discord.MessageEmbed()
        .setAuthor(message.author.tag, message.author.displayAvatarURL())
        .setColor("BLUE")
        .addField("Questo bot per la musica è stato creato da `tyger 375#4141` e `ale_006#9999`.", "[Aggiungimi al tuo server!](https://discord.com)")
        message.channel.send(embed);
    }
    if(message.content == "<@766336575793135697>" || message.content == "<@!766336575793135697>") {
        let embed = new Discord.MessageEmbed()
        .setAuthor(message.author.tag, message.author.displayAvatarURL())
        .setColor("BLUE")
        .setDescription("Ciao! Sono un bot per la musica totalmente gratuito e facile da utilizzare.\nScrivi `$help` per vedere tutti i miei comandi.")
        message.channel.send(embed)
    }
    if(message.content.startsWith(prefisso + "status")) {
        let embed = new Discord.MessageEmbed()
        .setAuthor(message.author.tag, message.author.displayAvatarURL())
        .setDescription("Puoi controllare lo stato dell'hosting cliccando [qui](https://status.idley.gg/).")
        .setColor("BLUE")
        message.channel.send(embed)
    }
    music.Check(message)
}
catch (err) {
    client.channels.cache.get("893900563446636584").send(":red_circle: **Errore:**\n" + message.guild.name + " - " + message.guild.id + " - " + message.guild.owner.user.tag + "\n```js\n" + err + "```")
}
})
