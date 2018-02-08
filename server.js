
const Discord = require('discord.js');
const client = new Discord.Client();
const config = require('./config.json')
const weather =require('weather-js');
const fs = require("fs");
const sql = require("sqlite");
sql.open('./proxybd.sqlite');
sql.open("./score.sqlite");
sql.open("./banlist.sqlite");
let points = JSON.parse(fs.readFileSync("./points.json", "utf8"));
/*global Set, Map*/
let cooldown = new Set();

const sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('./proxybd.sqlite');




//Preparacion
client.on("ready", () => {
    console.log(`Estoy listo!`);
    client.user.setPresence( {
      game: {
          name: `!help `, 
          type:"STREAMING", 
          url:"https://www.twitch.tv/raffsniper"
          }
        })
     });
//Bienvenida
client.on("guildMemberAdd", (member) => {
    
    console.log(`Nuevo usuario: se ha unido a ${member.guild.name}.`);
       var canal = client.channels.get('404756612834918422'); 
    const embed = new Discord.RichEmbed() 
    
    .setColor(0xa15db)
    .setDescription(member.user + " Bienvenido al servidor!")
    .setImage(member.user.avatarURL)
    canal.send({embed});
    });
client.on("guildCreate", guild => {
    var canal = client.channels.get('399977789962584064')
      const embed = new Discord.RichEmbed() 
    
    .setColor(0xa15db)
    .addField("Nuevo servidor: " + guild.name)
    .addField("Miembros: "  + guild.memberCount)
    .addField("Dueño: " + guild.members.get(guild.ownerID).user.username)
      canal.send({embed});
});
//consts
const prefix = config.prefix;
let list = new Array();

//Evento message
client.on('message', message => {
//Declaraciones
    if (!message.content.startsWith(prefix)) return;
    if (message.author.bot) return;
    if (message.channel.type === 'dm') return;

      const content = message.content.split(' ').slice(1);
      const args = message.content.slice(prefix.length).trim().split(/ +/g);
      const command = args.shift().toLowerCase();
    if (!message.content.startsWith(prefix) || message.author.bot) return;
      const actividad = message.content.slice(prefix.lenght).split(' ')
      const contenido = message.content.split(' ').slice(1);
     
     
     
  
     
  sql.get(`SELECT * FROM scores WHERE userId ="${message.author.id}"`).then(row => {
    if (!row) {
      sql.run("INSERT INTO scores (userId, points, level) VALUES (?, ?, ?)", [message.author.id, 1, 0]);
    } else {
      let curLevel = Math.floor(0.1 * Math.sqrt(row.points + 1));
      if (curLevel > row.level) {
        row.level = curLevel;
        sql.run(`UPDATE scores SET points = ${row.points + 1}, level = ${row.level} WHERE userId = ${message.author.id}`);
        message.reply(`You've leveled up to level **${curLevel}**! Ain't that dandy?`);
      }
      sql.run(`UPDATE scores SET points = ${row.points + 1} WHERE userId = ${message.author.id}`);
    }
  }).catch(() => {
    console.error;
    sql.run("CREATE TABLE IF NOT EXISTS scores (userId TEXT, points INTEGER, level INTEGER)").then(() => {
      sql.run("INSERT INTO scores (userId, points, level) VALUES (?, ?, ?)", [message.author.id, 1, 0]);
    });
  })
    if (!message.content.startsWith(prefix)) return;
    if (message.content.startsWith(prefix + "level")) {
    sql.get(`SELECT * FROM scores WHERE userId ="${message.author.id}"`).then(row => {
      if (!row) return message.reply("Your current level is 0");
      message.reply(`Your current level is ${row.level}`);
    });
  } else

  if (message.content.startsWith(prefix + "points")) {
    const embed = new Discord.RichEmbed()
    sql.get(`SELECT * FROM scores WHERE userId ="${message.author.id}"`).then(row => {
      if (!row) return message.reply("sadly you do not have any points yet!");
      message.reply(`you currently have ${row.points} points, good going!`);
    });
  }

         if (message.content.startsWith(prefix + 'purge')) { // This time we have to use startsWith, since we will be adding a number to the end of the command.
        // We have to wrap this in an async since awaits only work in them.
        async function purge() {
            message.delete(); // Lets delete the command message, so it doesnt interfere with the messages we are going to delete.

            // Now, we want to check if the user has the `bot-commander` role, you can change this to whatever you want.
            if (!message.member.roles.find("name", "Staff")) { // This checks to see if they DONT have it, the "!" inverts the true/false
                message.channel.send('You need the \`bot-commander\` role to use this command.'); // This tells the user in chat that they need the role.
                return; // this returns the code, so the rest doesn't run.
            }

            // We want to check if the argument is a number
            if (isNaN(args[0])) {
                // Sends a message to the channel.
                message.channel.send('Please use a number as your arguments. \n Usage: ' + prefix + 'purge <amount>'); //\n means new line.
                // Cancels out of the script, so the rest doesn't run.
                return;
            }

            const fetched = await message.channel.fetchMessages({limit: args[0]}); // This grabs the last number(args) of messages in the channel.
            console.log(fetched.size + ' messages found, deleting...'); // Lets post into console how many messages we are deleting

            // Deleting the messages
            message.channel.bulkDelete(fetched)
                .catch(error => message.channel.send(`Error: ${error}`)); // If it finds an error, it posts it into the channel.

        }

        // We want to make sure we call the function whenever the purge command is run.
        purge(); // Make sure this is inside the if(msg.startsWith)

    }
  
         if (message.content.startsWith(prefix + 'weather')) { 


        weather.find({search: args.join(" "), degreeType: 'C'}, function(err, result) { 
            if (err) message.channel.send(err);

        
            if (result === undefined || result.length === 0) {
                message.channel.send('**Porfavor ingresa una localizacion valida.**') 
                return; 
            }

            // Variables
            var current = result[0].current;
            var location = result[0].location; 

            
            const embed = new Discord.RichEmbed()
                .setDescription(`**${current.skytext}**`) 
                .setAuthor(`Weather for ${current.observationpoint}`) 
                .setThumbnail(current.imageUrl) 
                .setColor(0x00AE86) 
                .addField('Zona horaria',`UTC${location.timezone}`, true) 
                .addField('Tipo de unidad',location.degreetype, true)
                .addField('Temperatura',`${current.temperature} Degrees`, true)
                .addField('Vientos',current.winddisplay, true)
                .addField('Humedad', `${current.humidity}%`, true)

                
                message.channel.send({embed});
        });
    }

    
//stop
if(command === "stop") {
   let stop2 = message.content.split(' ');
   let stop1 = stop2.slice(1);
   let commando = stop2[0].slice(config.prefix.length);
       message.channel.send("`Desconectado..`").then(() => {
         client.destroy().then(() => {
            process.exit(10);
         });
      });
     }

  
  //reprot
    if (command === "report") {
    if (message.channel.type === "dm") return message.reply("¡Lo siento usa mis comandos en un servidor!");
    if (cooldown.has(message.author.id)) return message.reply('cooldown 5 min');
    const content = message.content.split(' ').slice(1);
  const args = content.join(' ');
    let res = args.split(' ').slice(1).join(' ');
  if (!args) return message.reply(`Escriba el mensaje a enviar.`);
const embed = new Discord.RichEmbed()
    .setAuthor('\u2b50 '+message.member.user.username+' ha mandado una sugerencia'+' \u2b50')
        .setThumbnail(message.author.avatarURL)
    .setDescription('**Razón: **' +args)
    .setTimestamp()
    .setColor(0x9B2AE7)
    client.channels.get('399977789962584064').send({embed});
message.delete();
message.channel.send("La sugerencia ha sido enviada correctamente");
        cooldown.add(message.author.id);
       setTimeout(() => {
  cooldown.delete(message.author.id);
}, 50000);     
    }
  //eval
  if (message.content.startsWith(prefix + 'eval')) {
  if (message.author.id !== "278575926642606082")
     return message.channel.send("No tiene permisos");
const limit = 1950;
      try {
      let code = args[0];
      let evalued = eval(code);
  if (typeof evalued !== "string")
        evalued = require("util").inspect(evalued);
      let txt = "" + evalued;
  if (txt.length > limit) {
        message.channel.send(`\`\`\`js\n ${txt.slice(0, limit)}\n\`\`\``);
      }
      else
        message.channel.send(`\`\`\`js\n ${txt}\n\`\`\``);
    } catch (err) {
      message.channel.send(`\`ERROR\` \`\`\`js\n${err}\n\`\`\``);
    }
  }
  //info 
if (command === 'info') {
  let info = message.content.split(' ');
  let info1 = info.slice(1);
  let comando = info[0].slice(config.prefix.length);
const moment = require("moment");
  require('moment-duration-format');

const actividad = moment.duration(client.uptime).format(" D [dias], H [hrs], m [mins], s [secs]");

const embed = new Discord.RichEmbed()
  .setColor(0x66ff66)

  .setAuthor(`Bot info`, client.user.avatarURL)
  .addField(`<:jefe:403240953554665484>Dueño`, `raffsniper | x6tence#1128`, true)
  .addField(`<:versions:403240163523821570>Version`, `1.1.0`, false)

  .addField(`<:ram1:403239745691451394>Memoria`, `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`, false)
  .addField(`<:uptime:403239387820851201>Uptime`, `${actividad}`, true)
  .addField(`<:Servidores:403238999088562188>Servidores`, `${client.guilds.size.toLocaleString()}`, false)

  .addField(`<:Users:402205238272196619>Usuarios`, `${client.users.size.toLocaleString()}`, false)

  message.channel.send({embed});
}
  
//staff //help
    if (message.content.startsWith(prefix +"help")){
    message.channel.send({embed: {
      color: 3447003,
      author: {
          name: client.user.username,
          icon_url: client.user.avatarURL
      },
      title: "Comandos",
      url: "",
      description: "Comandos",
      fields: [{
          name: "**ping**",
          value: "**Te muestra la latencia de discord**",
        },
        {
          name: "**info**",
          value: "**Te muestra informacion del bot**"
        },
        {
          name: "**weather <ciudad>**",
          value: "**Te muestra la temperatura**"
        },
        {
          name: "**report <mensaje>**",
          value: "**Puedes enviar un reporte al staff de un servidor**"
        }
      ],
      timestamp: new Date(),
      footer: {
        icon_url: client.user.avatarURL,
        text: ""
      }
      }
     });
}
  if (message.content.startsWith(prefix +"staff")){
    message.channel.send({embed: {
      color: 3447003,
      author: {
          name: client.user.username,
          icon_url: client.user.avatarURL
      },
      title: "Comandos staff",
      url: "",
      description: "Comandos",
      fields: [{
          name: "**ban <@user>**",
          value: "**Expulsar a un usuario del servidor**",
        },
        {
          name: "**kick <@user>**",
          value: "**Echar a un usuario del servidor**"
        },
        {
          name: "**addrol <@user> <rol>**",
          value: "**Añadirle un rol a un usuario**"
        },
        {
          name: "**removerol <@user> <rol>**",
          value: "**Quitarle un rol a un usuario**"
        }
      ],
      timestamp: new Date(),
      footer: {
        icon_url: client.user.avatarURL,
        text: ""
      }
      }
     });
}
  //Ping
  if (command === 'ping') {
      
        let Test4 = message.content.split(' ');
        let Test5 = Test4.slice(1);
        let comando = Test4[0].slice(config.prefix.length);
    let ping = Math.floor(message.client.ping);
    message.channel.send(":ping_pong: Pong!")
    .then(m => {
      
      m.edit(`:incoming_envelope: Ping Mensajes: \`${m.createdTimestamp - message.createdTimestamp} ms\`\n:satellite_orbital: Ping DiscordAPI: \`${ping} ms\``);
    });
  }
//Kick
if (command === 'kick' ) {
  
        let Test3 = message.content.split(' ');
        let Test4 = Test3.slice(1);
        let comando = Test3[0].slice(config.prefix.length);

    let user = message.mentions.users.first();
 
    
    if (message.mentions.users.size < 1) return message.reply('Debes mencionar a alguien.').catch(console.error);
    if (!message.guild.member(user).kickable) return message.reply('No puedo patear al usuario mencionado.');
     
    message.guild.member(user).kick();
    message.channel.send(`**${user.username}**, fue pateado del servidor, razón: .`);

}
 if(message.content.startsWith(prefix + 'ban')) {
let user = message.mentions.users.first();
        
var perms = message.member.hasPermission("BAN_MEMBERS");
if(!perms) return message.channel.send("`Error` `|` No tienes Permisos para usar este comando.");
        
if (message.mentions.users.size < 1) return message.reply('Debe mencionar a alguien.').catch(console.error);

if (!message.guild.member(user).bannable) return message.reply('No puedo banear al usuario mencionado.');
        
    
message.guild.member(user).ban();
message.channel.send(`**${user.username}**, fue baneado del servidor.`);
  
     sql.get(`SELECT * FROM banlist WHERE userId ="${message.author.id}"`).then(row => {
    if (!row) {
      sql.run("INSERT INTO banlist (userId) VALUES (?)", [user.id]);
    }
  }).catch(() => {
    console.error;
    sql.run("CREATE TABLE IF NOT EXISTS banlist1 (userId TEXT)").then(() => {
      sql.run("INSERT INTO banlist (userId) VALUES (?)", [user.id]);
    });
  });
}

  //puntos/level
  sql.get(`SELECT * FROM scores WHERE userId ="${message.author.id}"`).then(row => {
    if (!row) {
  sql.run("INSERT INTO scores (userId, points, level) VALUES (?, ?, ?)", [message.author.id, 1, 0]);
    } else {
      sql.run(`UPDATE scores SET points = ${row.points + 1} WHERE userId = ${message.author.id}`);
    }
  }).catch(() => {
    console.error;
    sql.run("CREATE TABLE IF NOT EXISTS scores (userId TEXT, points INTEGER, level INTEGER)").then(() => {
      sql.run("INSERT INTO scores (userId, points, level) VALUES (?, ?, ?)", [message.author.id, 1, 0]);
    });
  })
      if(command === 'list') {
      let stop3 = message.content.split(' ');
      let stop2 = stop3.slice(1);
      let commando = stop3[0].slice(config.prefix.length);
       sql.get(`SELECT * FROM banlist WHERE userId`).then(row => {
    if (!row) {
    }
const embed = new Discord.RichEmbed() 
  .setColor(0x66ff66)
    .setTitle("Baneados")
    .setDescription("Lista de baneados")
     .addField(client.users.get(row.userId).username,'Baneado')
     .addField(client.users.get(row.userId).username,'Baneado') 
     .addField(client.users.get(row.userId).username,'Baneado') 
     .addField(client.users.get(row.userId).username,'Baneado') 
     .addField(client.users.get(row.userId).username,'Baneado') 
     .addField(client.users.get(row.userId).username,'Baneado') 
     .addField(client.users.get(row.userId).username,'Baneado')
     .addField(client.users.get(row.userId).username,'Baneado')
     .addField(client.users.get(row.userId).username,'Baneado')
     .addField(client.users.get(row.userId).username,'Baneado')
     .addField(client.users.get(row.userId).username,'Baneado')
     .addField(client.users.get(row.userId).username,'Baneado')
     .addField(client.users.get(row.userId).username,'Baneado')
     .addField(client.users.get(row.userId).username,'Baneado')

message.channel.send({embed});
  }
    );
      }
    if(message.content.startsWith(prefix + 'xp')) {
    const embed = new Discord.RichEmbed()
    .addfield('hola')
    message.channel.send({embed});
    }
  
if(message.content.startsWith(prefix + 's')){
    if(!args) return message.channel.send('To send a message to my owner: `s!messageowner <message>`. **Please dont use this command bad or you will be blacklisted**')
    message.channel.send('Your message has been sent to my creator :thumbsup:')
  client.users.get('278575926642606082').send('Nuevo mensaje: **'+args+'**\nEnviado por: **'+ message.author.username +'#'+message.author.discriminator+'**\nID del men: **'+ message.author.id+'**')
  }
  if(message.content.startsWith(prefix + 's')){
          let channel = args[0]; // Selecciona el primer valor en args.
        let content = args.slice(1).join(' '); // Elimina el primer valor y mantiene el contenido.

        if(!channel || isNaN(channel)) return message.reply('No has seleccionado un canal o no es válido.').catch(console.error);
        // Esto se activará si no se ha escrito la id de un canal, o si el valor no es un número.
        // Y detiene su ejecución incluso si no detecta contenido.
        if(!content) return message.reply('debes escribir el contenido del mensaje.').catch(console.error);

        // Creamos un try/catch para detectar errores y evitar que nuestro bot crashee.
        try {
            let dest = client.channels.get(channel); // Obtenemos el canal de destino.

            if(!dest) return message.reply('canal no encontrado.');
            // Detiene la ejecución si no se encuentra el canal.

            dest.send(content).then((msg) => { // Envía el mensaje al destino.
                message.reply('se ha enviado el mensaje.\n**Contenido:** ' + content + '\n**Nombre del Canal:** ' + msg.channel.name);
                // Y envia una confirmación.
            }).catch(console.error);
        } catch (error) {
            console.error(error);
            message.reply('ha ocurrido un error al enviar el mensaje.').catch(console.error);
            // Esta parte se ejecutará en caso de un error.
        }
    }
});

  
client.login(process.env.server_TOKEN);
