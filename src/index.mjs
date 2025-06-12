import express, { request, response } from 'express';

const app = express();
import cors from "cors";
const corsOptions= {
    origin:  "http://localhost:5173",
}

app.use(cors(corsOptions));
app.use(express.json());

const PORT = process.env.PORT || 3000;

const users = [{id:1 , username: "Oktay", surname: "Giniş" ,mail: "oktay@gmail.com",tel: "05535547477",firmName:"Sigun",firmId:125,status:"aktif",role:"kullanıcı",birthdate:"17/09/2004",gender:"erkek",known_language:"Türkçe,İngilizce"},
                    {id:2 , username: "Ayşe", surname: "Kütük",mail: "ayşe@hotmail.com",tel: "05630862663",firmName:"Amazon",firmId:123,status:"aktif",role:"izleyici",birthdate:"14/02/1999",gender:"kadın",known_language:"Türkçe,İngilizce,Almanca"},
                    {id:3 , username: "Mehmet", surname: "Yıldırım",mail: "mehmet@yahoo.com",tel: "053562163327",firmName:"Amazon",firmId:123,status:"pasif",role:"yönetici",birthdate:"10/03/1993",gender:"erkek",known_language:"Türkçe,Rusça"},
                    {id:4 , username: "Ali", surname: "Yılmaz",mail: "ali@yahoo.com",tel: "051223522623 ",firmName:"Meta",firmId:126,status:"aktif",role:"izleyici",birthdate:"12/01/1990",gender:"erkek",known_language:"Türkçe,İngilizce,Farsça"},
                    {id:5 , username: "Sinem", surname: "Çetin",mail: "sinem@hotmail.com",tel: "056420078702",firmName:"Meta",firmId:126,status:"pasif",role:"kullanıcı",birthdate:"07/06/1966",gender:"kadın",known_language:"Türkçe,İngilizce,Fransızca,Almanca"},
                    {id:6 , username: "Ersan", surname: "Aşık",mail: "ersan@gmail.com",tel: "052186200626",firmName:"Sigun",firmId:125,status:"pasif",role:"yönetici",birthdate:"17/02/1976",gender:"erkek",known_language:"Türkçe,İngilizce,Çince"},
                    {id:7 , username: "Deniz", surname: "Diken",mail: "deniz@hotmail.com",tel: "052762691813",firmName:"Siemens",firmId:124,status:"aktif",role:"izleyici",birthdate:"17/02/1988",gender:"kadın",known_language:"İngilizce,Fince"},
                    {id:8 , username: "Sezer", surname: "Korkmaz",mail: "sezer@yahoo.com",tel: "056216246443",firmName:"Havelsan",firmId:127,status:"aktif",role:"kullanıcı",birthdate:"01/07/1999",gender:"erkek",known_language:"Türkçe"},
                    {id:9 , username: "Mert", surname: "Keleş",mail: "mert@gmail.com",tel: "052626726232",firmName:"Havelsan",firmId:127,status:"pasif",role:"yönetici",birthdate:"20/09/1972",gender:"erkek",known_language:"Türkçe,İngilizce,İspanyolca"},
                    {id:10 , username: "Duru", surname: "Dilli",mail: "duru@yahoo.com",tel: "057235262616",firmName:"Siemens",firmId:124,status:"pasif",role:"izleyici",birthdate:"17/02/1989",gender:"kadın",known_language:"İspanyolca,İngilizce"}
    ];

app.get("/", (request, response) => {
    response.status(201).send({msg: "Hello"});
});
app.get('/api/users',(request,response)=> {
    console.log(request.query);
    const { 
        query: {usernamefilter,firmidfilter},
     } = request; 

     let filtered = users;
     if(usernamefilter){
        filtered = filtered.filter((user) => user.username.includes(usernamefilter))
     }
     
      if(firmidfilter){
        filtered = filtered.filter((user) => user.firmId === Number(firmidfilter))
     }
     
     
     return response.json(
        {
            users:filtered
        }
       
    ); 
    
});

app.post('/api/users' , (request,response) =>  {
    console.log(request.body);
    const { body } = request;
    const newUser = {id: users[users.length-1].id+1, ...body};
    users.push(newUser);
    return response.status(201).send(newUser);
})
app.get('/api/firms',(request,response) =>{
    response.send([{id:123 , firmName: "Amazon" , firmMail: "info@amazon.com",address :"440 Terry Avenue North. Seattle, WA / USA. 98109.",tel: "031215793723",current_working_person:2,firmType:"Satıcı",firmStatus:"Aktif",latitude:50.47238,longitude:98.91295},
                    {id:124 , firmName: "Siemens" , firmMail: "info@siemens.com" ,address: "Birla Aurora, Level 21, Plot No. 1080 Dr. Annie Besant Road, Worli Mumbai Mumbai City MH IN 400030.",tel: "03129795722",current_working_person:2,firmType:"Alıcı",firmStatustatus:"Onay aşamasında",latitude:45.80410,longitude:5.23837},
                    {id:125 , firmName: "Sigun" , firmMail: "info@sigun.com.tr", address: "Üniversiteler Mahallesi, ODTÜ Teknokent Silikon Blok BK-16, 06800 Çankaya/Ankara",tel:"03122270564",current_working_person:2,firmType:"Satıcı",firmStatus:"Aktif",latitude:39.900143939375766,longitude:32.773717893715386},
                    {id:126 , firmName: "Meta" , firmMail: "info@meta.com", address: "1 Hacker Way, Menlo Park, CA 94025, US - MapQuest.",tel: "O3124971512",current_working_person:2,firmType:"Aracı",firmStatus:"Pasif",latitude:53.46373,longitude:45.97945},
                    {id:127 ,firmName: "Havelsan", firmMail: "info@havelsan.com" , address: "Mustafa Kemal, Şht. Öğretmen Şenay Aybüke Yalçın Cd. No:39, 06510 Çankaya/Ankara",tel:"03122927400",current_working_person:2,firmType:"Alıcı",firmStatus:"Bilgi bekleniyor",latitude:39.91372058783552,longitude:32.77577256210086},
    ])
});

app.put('/api/users/:id' , (request,response) => {
    const {
        body,
        params: { id } ,

    }=request;

    const parsedId = parseInt(id);
    if(isNaN(parsedId)) return response.sendStatus(400);

    const findUserIndex = users.findIndex((user) => user.id === parsedId);

    if(findUserIndex === -1 ) return response.sendStatus(404);

    users[findUserIndex] = { id: parsedId, ...body};
    return response.sendStatus(200);
})

app.get('/api/users/:id', (request,response)=> {
    console.log(request.params);
    const parsedId = parseInt(request.params.id);
    
    if(isNaN(parsedId)) 
        return response.status(400).send({msg: "Bad Request. Invalid ID!"});

    const findUser = users.find((user) => user.id === parsedId);
    if(!findUser) return response.sendStatus(404);
    return response.send(findUser);
})

app.listen(PORT, () => {
    console.log(`Running on Port ${PORT}`);
});

//localhost:3000
// localhost:3000/users
//localhost:3000/firms