const Discord = require("discord.js")
const client = new Discord.Client()
client.login("token")
const music = require("./music")

var prefisso = "$"

client.on("message", async (message) => {
    if(message.author.bot) return
    if(message.content == prefisso + "help"){
        var embed = new Discord.MessageEmbed()
        .setTitle("Comandi Bot")
        .setAuthor("Bot by tyger 375#4141")
        .setDescription("https://tyger375.tk/")
        .addField(prefisso + "helpMusic", "Mostra i comandi della musica")
        message.channel.send(embed)
    }
    if(message.content == prefisso + "credits"){
        var embed = new Discord.MessageEmbed()
        .setTitle("Credits")
        .addField("This music bot is made by tyger 375#4141", "website: https://tyger375.tk/")
        message.channel.send(embed);
    }
    music.Check(message)
})
