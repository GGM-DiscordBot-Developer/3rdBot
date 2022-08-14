const fs = require('fs');
const { Client, GatewayIntentBits, EmbedBuilder, ActivityType, DMChannel } = require('discord.js');
const client = new Client({intents : [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.DirectMessages]});

client.on('ready', () => {
    client.user.setActivity({ name : "!3기생", type : ActivityType.Playing });
});

const iconURL = "https://cdn.discordapp.com/icons/936986922130223105/a2aecb9c4c65f0839b94869228a80fe5.webp?size=100%5C";

var helpEmbed = new EmbedBuilder()
.setColor(`#00A651`)
.setTitle('**명령어** 📒')
.setFooter({ text : "Made by DevSeok & SEH00N", iconURL : iconURL })
.setFields(
    { name : "!3기생", value : "명령어를 알려줍니다." },
    { name : "!학생조회 *학생이름*", value : "해당 이름을 가진 모든 학생을 조회합니다." },
    { name : "!학생등록", value : "학생정보를 등록합니다." },
    { name : "!학생수정 ", value : "기능 준비중입니다." },
    { name : "!학생삭제 ", value : "자신의 학생정보를 삭제합니다." }
);

var exampleEmbed = new EmbedBuilder()
.setColor(`#49443C`)
.setTitle("'학생명 학번 전화번호 생일'을 입력해주세요.")
.setFooter({ text : "Made by DevSeok & SEH00N", iconURL : iconURL })
.setFields({ name : "입력 예시 : ", value : "홍길동 10101 01012345678 0505"});

var infoEmbed = new EmbedBuilder()
.setColor('#d49dfc')
.setFooter({ text : "Made by DevSeok & SEH00N", iconURL : iconURL });

var studentFile = require('./studentData.json');

var dmInfo = {
    onDM : false,
    channel : null,
    startTime : new Date()
};

var waitChannel = [];

client.on('messageCreate', msg => {
    var date = new Date();

    if(dmInfo.onDM && !msg.author.bot && (msg.channel == dmInfo.channel))
    {
        const studentData = msg.content.split(' ');
        if(studentData.length != 4)
        {
            msg.reply("올바른 형식의 정보를 입력해주세요.");
            return;
        }

        studentFile[msg.author.id] = {
            name : studentData[0],
            stuNum : studentData[1],
            phoneNum : studentData[2],
            birthday : `${(studentData[3][0] + studentData[3][1])}월 ${(studentData[3][2] + studentData[3][3])}일`
        };
        fs.writeFileSync('./studentData.json', JSON.stringify(studentFile));
        msg.channel.send({ embeds : [SetInfoEmbed(studentFile[msg.author.id])]});
        if(waitChannel.length >= 1) waitChannel.forEach(channel => channel.send("학생정보 등록이 완료되었습니다."));
        // infoEmbed.data.fields = [];
        dmInfo.onDM = false;
    }
    if(!msg.content.startsWith('!')) return;

    const args = msg.content.split('!')[1].split(' ');

    switch(args[0])
    {
        case '3기생':
            msg.channel.send({ embeds : [helpEmbed] });
            break;
        case '학생등록':
            if(studentFile[msg.author.id] != undefined) 
            {
                msg.reply("이미 등록된 디스코드 계정입니다.");
                return;
            }
            if(dmInfo.onDM) 
            {
                if(((date.getMinutes() * 60 + date.getSeconds()) - (dmInfo.startTime.getMinutes() * 60 + dmInfo.startTime.getSeconds())) > 30)
                {
                    dmInfo.channel.send("학생등록 시간이 초과되었습니다.");
                    msg.author.createDM().then(dmChannel => {
                        dmChannel.send({ embeds : [exampleEmbed]});
                        dmInfo.onDM = true;
                        dmInfo.channel = dmChannel;
                        dmInfo.startTime = date;
                    });
                    return;
                }
                msg.reply("다른 사람이 등록을 진행중입니다. 잠시만 기다려주세요.");
                if(waitChannel.indexOf(msg.channel) == -1)
                    waitChannel.push(msg.channel);
                return;
            }
            msg.author.createDM().then(dmChannel => {
                dmChannel.send({ embeds : [exampleEmbed]});
                dmInfo.onDM = true;
                dmInfo.channel = dmChannel;
                dmInfo.startTime = date;
            });
            break;
        case '학생조회':
            if(Object.keys(studentFile).length <= 0)
            {
                msg.reply("조회할 학생 데이터가 없습니다.");
                return;
            }
            var stuData = null;
            Object.values(studentFile).forEach(data => {
                if(data == undefined) return;
                if(data.name == args[1])
                {
                    msg.channel.send({ embeds : [SetInfoEmbed(data)] });
                    infoEmbed.data.fields = [];
                    stuData = data;
                }
            });
            if(stuData == null) 
            {
                msg.reply("조회할 학생 데이터가 없습니다.");
                return;
            }
            break;
        case '학생삭제':
            if(studentFile[msg.author.id] == undefined)
            {
                msg.reply("등록되어있지 않은 계정입니다.");
                return;
            }
            studentFile[msg.author.id] = undefined;
            fs.writeFileSync('./studentData.json', JSON.stringify(studentFile));
            break;
        case '학생수정':
            if(studentFile[msg.author.id] == undefined)
            {
                msg.reply("등록되어있지 않은 계정입니다.");
                return;
            }
            if (((date.getMinutes() * 60 + date.getSeconds()) - (dmInfo.startTime.getMinutes() * 60 + dmInfo.startTime.getSeconds())) > 30) {
                dmInfo.channel.send("학생등록 시간이 초과되었습니다.");
                msg.author.createDM().then(dmChannel => {
                    dmChannel.send({ embeds: [exampleEmbed] });
                    dmInfo.onDM = true;
                    dmInfo.channel = dmChannel;
                    dmInfo.startTime = date;
                });
                return;
            }
            msg.reply("다른 사람이 등록을 진행중입니다. 잠시만 기다려주세요.");
            if (waitChannel.indexOf(msg.channel) == -1)
                waitChannel.push(msg.channel);
            break;
    }
});

const SetInfoEmbed = stuData => {
    infoEmbed
    .setTitle(`${stuData.name}님의 정보`)
    .setFields(
        { name : "이름", value : stuData.name },
        { name : "학번", value : stuData.stuNum },
        { name : "전화번호", value : stuData.phoneNum },
        { name : "생일", value : stuData.birthday }
    )
    return infoEmbed;
}

client.login(require('../tokens.json')['3rdBot']);