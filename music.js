const Discord = require("discord.js");
const Bot = new Discord.Client();
const yts = require('yt-search');
const ytdl = require('ytdl-core');
Bot.login("token");

var prefisso = "$";
var CanzoneInRiproduzione;
var isLoop = false;
var coda = [];
let dispatcher;
var CodaCanzoni = []
module.exports = {
    Check: function(message){
        Musica(message);
    }
}
async function Musica(message){
    if(!message.guild){
        return
    }
    if(message.content == prefisso + "help"){
        var Embed = new Discord.MessageEmbed()
        .setAuthor(message.author.tag, message.author.displayAvatarURL())
        .setColor("BLUE")
        .addField("▫️" + prefisso + "playnow", "Cancella le canzoni nella coda, e riproduce subito la canzone richiesta.")
        .addField("▫️" + prefisso + "play", "Cerca una canzone. Ti da 10 opzioni.")
        .addField("▫️" + prefisso + "choose", "Seleziona la canzone tra le 10 opzioni.")
        .addField("▫️" + prefisso + "coda", "Mostra la coda di riproduzione.")
        .addField("▫️" + prefisso + "skip", "Riproduci la canzone successiva.")
        .addField("▫️" + prefisso + "isplaying", "Mostra dettagli sulla canzone in riproduzione.")
        .addField("▫️" + prefisso + "leave", "Abbandona il canale vocale.")
        .addField("▫️" + prefisso + "pause", "Metti in pausa una canzone.")
        .addField("▫️" + prefisso + "resume", "Riproduci la canzone da zero, se in pausa.")
        .addField("▫️" + prefisso + "credits, " + prefisso + "status, " + prefisso + "invite, " + prefisso + "support", "Quei comandi utili che non possono mancare...")
        message.channel.send(Embed)
    }
    if(message.member.voice.channel == null && message.content.startsWith(prefisso) && !message.content == "$status" && !message.content == "$help" && !message.content == "$invite") {
        let embed = new Discord.MessageEmbed()
        .setAuthor(message.author.tag, message.author.displayAvatarURL())
        .setDescription("**Entra in un canale vocale.**")
        .setColor("BLUE")
        return message.channel.send(embed)
    }
    if(message.content.startsWith(prefisso + "playnow")){
        var lunghezza = message.content.length;
        var canzone = message.content.slice(11, lunghezza);
        if(!canzone) return message.channel.send(":x: **Specifica un titolo o un autore.**")
        const res = await yts(canzone);
        let video = res["all"][0];
        CanzoneInRiproduzione = video.url;
        message.channel.send("Riproduco: " + res["all"][0]["title"]);
        coda.length = 0;
        coda.push(video.url);
        var ulrVideo = video.url.toString()
        setTimeout(async function() {

            if(message.guild.me.voice.channel == null){
                dispatcher.setVolume(1);
                dispatcher.on("finish", end => {
                    if(isLoop){
                        dispatcher = connection.play(ytdl(video.url));
                    } else {
                        if(coda.length > 1){
                            coda.splice(CanzoneInRiproduzione, 1);
                            dispatcher = connection.play(ytdl(coda[0]));
                            CanzoneInRiproduzione = coda[0];
                        } else {
                            CanzoneInRiproduzione = null;
                        }
                    } 
                }); 
            } else {
                connection = await message.member.voice.channel.join()
            }
        }, 2000 )
    }
    if(message.content.startsWith(prefisso + "choose")){
        var QualeCanzone = message.content.split(" ")[1]
        if(QualeCanzone == null){
            message.channel.send(":x: **Specifica un numero valido.**\nPrima di usare `$choose`, devi usare `$play`.")
            return;
        }
        try {
            const res = await yts(CodaCanzoni[QualeCanzone]);
            let video = res["all"][0];
            var voiceChannel = message.member.voice.channel;
            if(voiceChannel == null){
                message.channel.send("non sei in un canale vocale");
                return;
            }
            if(CanzoneInRiproduzione == null){
                CanzoneInRiproduzione = video.url;
                message.channel.send("Riproduco: " + res["all"][0]["title"]);
                coda.push(video.url);
                voiceChannel.join().then(connection =>{
                    dispatcher = connection.play(ytdl(video.url));
                    dispatcher.on("finish", end => {
                        if(isLoop){
                            dispatcher = connection.play(ytdl(video.url));
                        } else {
                            if(coda.length > 1){
                                coda.splice(CanzoneInRiproduzione, 1);
                                console.log(coda);
                                dispatcher = connection.play(ytdl(coda[0]));
                                CanzoneInRiproduzione = coda[0];
                            } else {
                                CanzoneInRiproduzione = null;
                            }
                        }
                    });
                }).catch(err => console.log(err));
            } else {
                message.channel.send("Aggiunto alla coda: " + res["all"][0]["title"]);
                voiceChannel.join().then(connection =>{
                    coda.push(video.url);
                }).catch(err => console.log(err));
            }
        } catch (error) {
            message.channel.send(":x: **C'è stato un errore.**\nControlla il comando `$help`.")
        }
    }
    if(message.content.startsWith(prefisso + "play") && !(message.content.startsWith(prefisso + "playnow"))){
        CodaCanzoni.length = 0;
        var lunghezza = message.content.length;
        var canzone = message.content.slice(5, lunghezza);
        if(!canzone) return message.channel.send(":x: **Specifica un titolo o un autore.**")
        const res = await yts(canzone);
        var Embed = new Discord.MessageEmbed()
        .setAuthor(message.author.tag, message.author.displayAvatarURL())
        .setColor("BLUE")
        .setDescription("**Ecco le canzoni trovate per:** `" + canzone + " `.")
        if(res["all"].length < 10){
            for (let i = 0; i < res["all"].length; i++) {
                const element = res["all"][i];
                Embed.addField(i, element.title)
                CodaCanzoni.push(element.url)
            }
        } else {
            for (let i = 0; i < 10; i++) {
                const element = res["all"][i];
                Embed.addField(i, element.title)
                CodaCanzoni.push(element.url)
            }
        }
        message.channel.send(Embed);
        return;
    }
    if(message.content == prefisso + "coda"){
        var embed = new Discord.MessageEmbed()
        .setAuthor(message.author.tag, message.author.displayAvatarURL())
        .setColor("BLUE")
        if(coda.length == 0){
          embed.addField("Non ci sono canzoni in riproduzione.", "Scrivi `$help` per iniziare...")
        } else {
          embed.setDescription("**Canzoni in coda:**")
          await Promise.all(coda.map(async (i) => {
              const res = await yts(i);
              let video = res["all"][0];
              embed.addField(video.title, "[Guarda su YouTube.](" + video.url + ")");
          }))
        }
        message.channel.send(embed);
    }
    if(message.content == prefisso + "skip"){
        if(coda.length > 1){
            message.channel.send("canzone skippata");
            coda.splice(CanzoneInRiproduzione, 1);
            CanzoneInRiproduzione = coda[0];
            var voiceChannel = message.member.voice.channel;
            const res = await yts(coda[0]);
            let video = res["all"][0];
            voiceChannel.join().then(connection =>{
                dispatcher = connection.play(ytdl(coda[0]));
                message.channel.send("Riproduco: " + video.title);
                dispatcher.on("finish", end => {
                    if(isLoop){
                        dispatcher = connection.play(ytdl(video.url));
                    } else {
                        if(coda.length > 1){
                            coda.splice(CanzoneInRiproduzione, 1);
                            dispatcher = connection.play(ytdl(coda[0]));
                            CanzoneInRiproduzione = coda[0];
                        } else {
                            CanzoneInRiproduzione = null;
                        }
                    }
                });
            }).catch(err => console.log(err));
        } else {
            message.channel.send("Non ci sono canzoni nella coda");
        }
    }
    if(message.content == prefisso + "isplaying"){
        try {
        const res = await yts(CanzoneInRiproduzione);
        var video = res["all"][0]
        var embed = new Discord.MessageEmbed()
        .setTitle("Canzone in riproduzione")
        .setURL(CanzoneInRiproduzione)
        .addField("Autore: ", video["author"]["name"], true)
        .addField("Titolo canzone:", video["title"], true)
        .addField("Views: ", video["views"], true)
        .addField("Pubblicato: ", video["ago"], true)
        .addField("Durata: ", video["duration"]["timestamp"], true)
        .setImage(video["image"])
        .setColor("BLUE")
        message.channel.send(embed)
        }
        catch {
            message.channel.send(":x: **Non sembrano esserci canzoni in riproduzione...**")
        }
    }
    if(message.content == prefisso + "loop"){
        if(isLoop){
            isLoop = "Ora il loop è **disattivato**.";
        } else {
            isLoop = "Ora il loop è **attivato**.";
        }
        let embed = new Discord.MessageEmbed()
        .setAuthor(message.author.tag, message.author.displayAvatarURL())
        .setDescription(isLoop)
        .setColor("BLUE")
        message.channel.send(embed);
    }
    if(message.content == prefisso + "pause"){
        if(dispatcher.paused){
            return message.channel.send(":x: **La canzone è già in pausa.**");
        }
        dispatcher.pause();
        let embed = new Discord.MessageEmbed()
        .setAuthor(message.author.tag, message.author.displayAvatarURL())
        .setDescription("**Canzone in pausa!**")
        .setColor("BLUE")
        message.channel.send(embed);
    }
    if(message.content == prefisso + "resume"){
        if(!dispatcher.paused){
            return message.channel.send(":x: **La canzone è già in riproduzione.**");
        }
        var voiceChannel = message.member.voice.channel;
        if(voiceChannel == null){
            message.channel.send(":x: **Non sei in un canale vocale.**");
            return;
        }
        voiceChannel.join().then(connection =>{
            dispatcher = connection.play(ytdl(coda[0]));
            dispatcher.on("finish", end => {
                if(isLoop){
                    dispatcher = connection.play(ytdl(video.url));
                } else {
                    if(coda.length > 1){
                        coda.splice(CanzoneInRiproduzione, 1);
                        dispatcher = connection.play(ytdl(coda[0]));
                        CanzoneInRiproduzione = coda[0];
                    } else {
                        CanzoneInRiproduzione = null;
                    }
                }
            });
        }).catch(err => console.log(err));
        let embed2 = new Discord.MessageEmbed()
        .setAuthor(message.author.tag, message.author.displayAvatarURL())
        .setDescription("*Riproduco la canzone...**")
        .setColor("BLUE")
        message.channel.send(embed);
    }
    if(message.content == prefisso + "leave"){
        coda.length = 0;
        CanzoneInRiproduzione = null;
        if(!message.guild.me.voice.channel) return message.channel.send(":x: **Non sono collegato in nessun canale vocale.**")
        const connection = await message.member.voice.channel;
        connection.leave();
        let embed = new Discord.MessageEmbed()
        .setAuthor(message.author.tag, message.author.displayAvatarURL())
        .setColor("BLUE")
        .setDescription("**Esco dal canale vocale...**")
        message.channel.send(embed);
    }
    if(message.content == prefisso + "join"){
        coda.length = 0;
        CanzoneInRiproduzione = null;
        const connection = await message.member.voice.channel;
        connection.join()
        let embed = new Discord.MessageEmbed()
        .setAuthor(message.author.tag, message.author.displayAvatarURL())
        .setColor("BLUE")
        .setDescription("**Sto entrando nel canale vocale...**")
        message.channel.send(embed);
    }
}
