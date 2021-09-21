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
    if(message.content == prefisso + "helpMusic"){
        var Embed = new Discord.MessageEmbed()
        .setTitle("Ecco i comandi per la musica:")
        .addField(prefisso + "playnow", "cancella le canzoni nella coda, e riproduce subito la canzone richiesta")
        .addField(prefisso + "play", "cerca la canzone richiesta e ti da 10 risultati, scegli la canzone giusta facendo: " + prefisso + "choose + numero canzone")
        .addField(prefisso + "coda", "mostra la coda di canzoni")
        .addField(prefisso + "skip", "riproduce la canzone successiva nella coda")
        .addField(prefisso + "isplaying", "mostra i dettagli della canzone in riproduzione")
        .addField(prefisso + "leave", "abbandona la chat vocale")
        .addField(prefisso + "pause", "mette in pausa la canzone")
        .addField(prefisso + "resume", "riproduce la canzone da capo se in pause")
        .setAuthor("bot by tyger 375#4141")
        message.channel.send(Embed)
    }
    if(message.member.voice.channel == null){
        return;
    }
    if(message.content.startsWith(prefisso + "playnow")){
        var lunghezza = message.content.length;
        var canzone = message.content.slice(11, lunghezza);
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
        if(CodaCanzoni == null){
            message.channel.send("Non c'è nessuna canzone")
            return;
        }
        var QualeCanzone = message.content.split(" ")[1]
        if(QualeCanzone == null){
            message.channel.send("Inserisci un numero valido")
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
                console.log(coda);
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
            console.log(error)
        }
    }
    if(message.content.startsWith(prefisso + "play") && !(message.content.startsWith(prefisso + "playnow"))){
        CodaCanzoni.length = 0;
        var lunghezza = message.content.length;
        var canzone = message.content.slice(8, lunghezza);
        const res = await yts(canzone);
        var Embed = new Discord.MessageEmbed()
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
        .setTitle("CANZONI")
        .setDescription("canzoni nella coda:")
        await Promise.all(coda.map(async (i) => {
            const res = await yts(i);
            let video = res["all"][0];
            embed.addField("canzone: ", video.title);
        }));
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
        message.channel.send(embed)
    }
    if(message.content == prefisso + "loop"){
        if(isLoop){
            isLoop = false;
        } else {
            isLoop = true;
        }
        message.channel.send("Loop: " + isLoop);
    }
    if(message.content == prefisso + "pause"){
        if(dispatcher.paused){
            return message.channel.send("Canzone già in pausa");
        }
        dispatcher.pause();
        message.channel.send("Canzone in pausa");
    }
    if(message.content == prefisso + "resume"){
        if(!dispatcher.paused){
            return message.channel.send("Canzone già in play");
        }
        var voiceChannel = message.member.voice.channel;
        if(voiceChannel == null){
            message.channel.send("non sei in un canale vocale");
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
        message.channel.send("Riproduco la canzone");
    }
    if(message.content == prefisso + "leave"){
        coda.length = 0;
        CanzoneInRiproduzione = null;
        const connection = await message.member.voice.channel;
        connection.leave();
        message.channel.send("Esco dal canale vocale");
    }
}
