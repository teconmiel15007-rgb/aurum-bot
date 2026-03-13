import makeWASocket, { useMultiFileAuthState } from "@whiskeysockets/baileys"
import fs from "fs"

const prefix = "!"

const dbFile = "./database/users.json"

const loadDB = () => JSON.parse(fs.readFileSync(dbFile))
const saveDB = (data) => fs.writeFileSync(dbFile, JSON.stringify(data, null, 2))

async function startBot(){

const { state, saveCreds } = await useMultiFileAuthState("./session")

const sock = makeWASocket({
auth: state
})

sock.ev.on("creds.update", saveCreds)

sock.ev.on("messages.upsert", async ({messages}) => {

const msg = messages[0]
if(!msg.message) return

const from = msg.key.remoteJid
const sender = msg.key.participant || from
const text = msg.message.conversation || ""

if(!text.startsWith(prefix)) return

const command = text.slice(1).split(" ")[0].toLowerCase()

let db = loadDB()

if(!db[sender]){
db[sender] = {
exp: 0,
nivel: 1,
mensajes: 0
}
}

db[sender].mensajes += 1
db[sender].exp += 5

if(db[sender].exp >= db[sender].nivel * 100){
db[sender].nivel += 1
}

saveDB(db)

if(command === "menu"){

await sock.sendMessage(from,{
text: `☕ Bienvenido a *Aurum Café*

Comandos disponibles:

!menu
!perfil
!rank
!cafe
!coin
!dado
!sticker

¿En qué puedo ayudarte hoy?`
})

}

if(command === "perfil"){

const user = db[sender]

await sock.sendMessage(from,{
text: `☕ Perfil de Cliente

Nivel: ${user.nivel}
EXP: ${user.exp}
Mensajes: ${user.mensajes}`
})

}

if(command === "rank"){

const ranking = Object.entries(db)
.sort((a,b)=> b[1].nivel - a[1].nivel)
.slice(0,5)

let textRank = "☕ Ranking del Café\n\n"

ranking.forEach((u,i)=>{
textRank += `${i+1}. Nivel ${u[1].nivel}\n`
})

await sock.sendMessage(from,{text: textRank})

}

if(command === "cafe"){

await sock.sendMessage(from,{
text: "☕ Aurum te sirve un espresso virtual."
})

}

if(command === "coin"){

const result = Math.random() < 0.5 ? "Cara" : "Cruz"

await sock.sendMessage(from,{
text: `🪙 Moneda: ${result}`
})

}

if(command === "dado"){

const num = Math.floor(Math.random()*6)+1

await sock.sendMessage(from,{
text: `🎲 Dado: ${num}`
})

}

})

}

startBot()
