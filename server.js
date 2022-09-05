
import http from 'http';
import { readFileSync, writeFileSync } from 'fs';
import dotenv from 'dotenv';
import { findLastId } from './utility/functions.js';


//env init
dotenv.config();

const PORT = process.env.SERVER_PORT;

//Data Management
const students_json = readFileSync('./data/students.json');
const students_obj = JSON.parse(students_json);



//server create
http.createServer((req, res) => {
    
    //Routing
    if(req.url == '/api/students' && req.method == 'GET'){
        res.writeHead(200, { 'Content-Type' : 'application/json' })
        res.end(students_json);

    }else if(req.url.match(/\/api\/students\/[0-9]{1,}/) && req.method == 'GET'){
        let id = req.url.split('/')[3]

        if( students_obj.some( stu => stu.id == id )){
            res.writeHead(200, { 'Content-Type' : 'application/json' })
            res.end(JSON.stringify(students_obj.find( stu => stu.id == id )));

        }else {
            res.writeHead(200, { 'Content-Type' : 'application/json' })
            res.end(JSON.stringify({
                message : 'Student not found'
            }));         
        }        
    }else if(req.url == '/api/students' && req.method == 'POST'){

        //req data handle
        let data = '';
        req.on('data', (chunk) => {
            data += chunk.toString();

        });
        req.on('end',() => {
            let { name, age, skill, location} = JSON.parse(data);
            
            students_obj.push({
                id : findLastId(students_obj),
                name : name,
                age : age,
                skill : skill,
                location : location
            });
            writeFileSync('./data/students.json', JSON.stringify(students_obj));

        });

        res.writeHead(200, { 'Content-Type' : 'application/json' })
            res.end(JSON.stringify({
                message : 'New Student data added successful'
            }));  

    }else if(req.url.match(/\/api\/students\/[0-9]{1,}/) && req.method == 'DELETE'){

        let id = req.url.split('/')[3]

        let delete_data = students_obj.filter(stu => stu.id != id);
        writeFileSync('./data/students.json', JSON.stringify(delete_data))

        res.writeHead(200, { 'Content-Type' : 'application/json' })
            res.end(JSON.stringify({
                message : 'New Student data delete successful'
            }));  

    }else if(req.url.match(/\/api\/students\/[0-9]{1,}/) && req.method == 'PUT' || req.url.match(/\/api\/students\/[0-9]{1,}/) && req.method == 'PATCH'){

        let id = req.url.split('/')[3]


        if(students_obj.some( stu => stu.id == id )){

            let data = '';

            req.on('data', (chunk) => {
                data += chunk.toString();

            });
            req.on('end', () => {
                let update_data = JSON.parse(data);
                students_obj[students_obj.findIndex( stu => stu.id == id)] = {
                    id : id,
                    name : update_data.name,
                    age : update_data.name,
                    skill : update_data.skill,
                    location : update_data.location
                }

                writeFileSync('./data/students.json', JSON.stringify(students_obj))
            });
        
            res.writeHead(200, { 'Content-Type' : 'application/json' });
            res.end(JSON.stringify({
                message : 'Student Data Update successful'
            })); 
        }else{
            res.writeHead(200, { 'Content-Type' : 'application/json' });
            res.end(JSON.stringify({
                message : 'Student Data not found'
            })); 
        } 

    }
    else{
        res.writeHead(200, { 'Content-Type' : 'application/json' })
        res.end(JSON.stringify({
            err: 'Invalid Route'
        }));
    }

}).listen( PORT, () => {
    console.log(`Server is running on port ${ PORT }`);
})