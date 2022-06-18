// here we do all functionality that sends requests to the api and retrive data so we can send it to the frontend and show it in a user
// interface 
const appRoutes = require('express').Router(); //call for Router method inside express module to give access for any endpoint
const e = require('cors');
const sql = require('mssql')//call for using sql module
let mssql = require('../configuration/mssql-pool-management.js')
const config = require('../Configuration/config')//call for using configuration module that we create it to store database conaction
const bcrypt = require('bcrypt');

module.exports.importMachine = async (req, res) => {
    let sqlPool = await mssql.GetCreateIfNotExistPool(config)
    let request = new sql.Request(sqlPool)

    await request.query(`
    INSERT INTO [dbo].[Machine]
               ([name]
               )
         VALUES
               ('${req.body.machineName}'
               )
    `);
    
    res.json('inserted successfully')
}

module.exports.addUser = async (req, res) => {
    let sqlPool = await mssql.GetCreateIfNotExistPool(config)
    let request = new sql.Request(sqlPool)

    console.log(`

    INSERT INTO [dbo].[user]
    ([userName]
    ,[password]
    ,[userCheckBox]
    ,[machineCheckBox]
    ,[taskCheckBox]
    ,[reportCheckBox]
    ,[permissionCheckBox])
VALUES
    ('${req.body.userName}'
    ,'${req.body.password}'
    ,'${req.body.checkbox0}'
    ,'${req.body.checkbox1}'
    ,'${req.body.checkbox2}'
    ,'${req.body.checkbox3}'
    ,'${req.body.checkbox4}')
    `);
    bcrypt.hash(req.body.password,8, async function (err, hash) {
    await request.query(`

    INSERT INTO [dbo].[user]
    ([userName]
    ,[password]
    ,[userCheckBox]
    ,[machineCheckBox]
    ,[taskCheckBox]
    ,[reportCheckBox]
    ,[permissionCheckBox])
VALUES
    ('${req.body.userName}'
    ,'${hash}'
    ,'${req.body.checkbox0}'
    ,'${req.body.checkbox1}'
    ,'${req.body.checkbox2}'
    ,'${req.body.checkbox3}'
    ,'${req.body.checkbox4}')
    `);
    
    
    res.json('inserted successfully')
});
}
module.exports.importTasks = async (req, res) => {
    let sqlPool = await mssql.GetCreateIfNotExistPool(config)
    let request = new sql.Request(sqlPool)
    let date=new Date().getTime();
    let tasksOrder;
    date += ((req.body.TaskDurationH*60*60*1000)+(req.body.TaskDurationM*60*1000))
    await request.query(`
    
    INSERT INTO [dbo].[Task]
               ([name]
               ,[duration]
               ,[endDate]
               ,[machineId])
         VALUES
               ('${req.body.name}'
               ,'${req.body.TaskDurationH}:${req.body.TaskDurationM}'
               ,'${new Date(date).toISOString()}'
               ,'${req.body.machineId}')
    `);
    let taskId=await (await request.query(`select max(id) from Task`)).recordset[0][""]
    if (await (await request.query(`select taskNumber from Machine where id=${req.body.machineId}`)).recordset[0].taskNumber==null || await (await request.query(`select taskNumber from Machine where id=${req.body.machineId}`)).recordset[0].taskNumber=='') 
        tasksOrder=taskId
    else
        tasksOrder=await (await request.query(`select taskNumber from Machine where id=${req.body.machineId}`)).recordset[0].taskNumber+","+taskId
    await request.query(`UPDATE [dbo].[Machine] SET [taskNumber]='${tasksOrder}' WHERE id=${req.body.machineId}`);
    res.json('inserted successfully')
}
module.exports.getMachine = async (req, res) => {
    let sqlPool = await mssql.GetCreateIfNotExistPool(config)
    let request = new sql.Request(sqlPool)
    let data=await request.query(`select * from Machine`);
    res.json(data.recordset)
}
module.exports.getTasks = async (req, res) => {
    let sqlPool = await mssql.GetCreateIfNotExistPool(config)
    let request = new sql.Request(sqlPool)
    let machineData=await request.query(`select * from Machine`);
    let taskData=await request.query(`select * from Task`);
    let machineId=[]
    let allData={}
    for (let i = 0; i < machineData.recordset.length; i++) {
        machineId.push(machineData.recordset[i].id)
        allData[machineData.recordset[i].id]=[]
    }
    for (let i = 0; i < taskData.recordset.length; i++) {
        for (let j = 0; j < machineId.length; j++) {
            if(machineId[j]==taskData.recordset[i].machineId){
                for (let k = 0; k < machineData.recordset[j].taskNumber.split(',').length; k++) {
                    if (machineData.recordset[j].taskNumber.split(',')[k]==taskData.recordset[i].id) {
                        allData[machineId[j]][ machineData.recordset[j].taskNumber.split(',').indexOf(machineData.recordset[j].taskNumber.split(',')[k])]=taskData.recordset[i]
                    }
                }
                // allData[machineId[j]].push(taskData.recordset[i])
                // delete allData.machineId
            }
        }
    }
    res.json(allData)
}
module.exports.deleteMachine = async (req, res) => {
    console.log(req.body);
    let sqlPool = await mssql.GetCreateIfNotExistPool(config)
    let request = new sql.Request(sqlPool)
    await request.query(`delete from Machine where id=${req.body.id}
                        delete from Task where machineId=${req.body.id}`);
    res.json('Deleted successfully')
}
module.exports.deleteTask = async (req, res) => {
    let sqlPool = await mssql.GetCreateIfNotExistPool(config)
    let request = new sql.Request(sqlPool)
    console.log(await (await request.query(`select machineId from Task where id=${req.body.id}`)));
    let mid =await (await request.query(`select machineId from Task where id=${req.body.id}`)).recordset[0].machineId
    let tasksOrder=await (await request.query(`select taskNumber from Machine where id=${mid}`)).recordset[0].taskNumber
    console.log(tasksOrder,tasksOrder.split(','),'before');
    console.log(tasksOrder.indexOf(req.body.id));
    let newIds=[];
    for (let i = 0; i < tasksOrder.split(',').length; i++) {
        if (tasksOrder.split(',')[i]!=req.body.id) {
            newIds.push(tasksOrder.split(',')[i])
        }
    }
    console.log(newIds.join(','));
    await request.query(`UPDATE [dbo].[Machine] SET [taskNumber]='${newIds.join(',')}' WHERE id=${mid}`);
    await request.query(`delete from Task where id=${req.body.id}`);
    res.json('Deleted successfully')
}
module.exports.updateTask = async (req, res) => {
    let sqlPool = await mssql.GetCreateIfNotExistPool(config)
    let request = new sql.Request(sqlPool)
    console.log(req.body);
    for (let i = 0; i < req.body.taskId.length; i++) {
        await request.query(`UPDATE [dbo].[Task] SET [machineId]=${req.body.machineId} WHERE id=${req.body.taskId[i]}`);
    }
    await request.query(`UPDATE [dbo].[Machine] SET [taskNumber]='${req.body.taskId.join(',')}' WHERE id=${req.body.machineId}`);
    await request.query(`UPDATE [dbo].[Machine] SET [taskNumber]='${req.body.taskIDsBefore.join(',')}' WHERE id=${req.body.machineIdBefore}`);
    res.json('Deleted successfully')
}
module.exports.changeTime = async (req, res) => {
    let sqlPool = await mssql.GetCreateIfNotExistPool(config)
    let request = new sql.Request(sqlPool)
    console.log(req.body);
    let newTask=await (await request.query(`select * from Task where id=${req.body.id}`)).recordset[0];
    let oldTask=await (await request.query(`select * from Task where id=${req.body.oldTask}`)).recordset[0];
    let newEndDate=new Date()
    newEndDate.setDate(newEndDate.getDate() - parseInt(newTask.duration.split(':')[0]))
    newEndDate.setHours(newEndDate.getHours() - parseInt(newTask.duration.split(':')[1]))
    newEndDate.setMinutes(newEndDate.getMinutes() - parseInt(newTask.duration.split(':')[2]))
    newEndDate.setSeconds(newEndDate.getSeconds() - parseInt(newTask.duration.split(':')[3]))
    console.log(req.body.id,new Date(newEndDate),new Date(newEndDate).toISOString(),parseInt(newTask.duration.split(':')[0]));
    await request.query(`UPDATE [dbo].[Task] SET [endDate]='${new Date(newEndDate).toISOString()}' WHERE id=${req.body.id}`);
    var seconds = Math.floor(((new Date().getTime()) - (new Date(oldTask.endDate).getTime()))/1000);
    var minutes = Math.floor(seconds/60);
    var hours = Math.floor(minutes/60);
    var days = Math.floor(hours/24);
    hours = hours-(days*24);
    minutes = minutes-(days*24*60)-(hours*60);
    seconds = seconds-(days*24*60*60)-(hours*60*60)-(minutes*60);
    console.log(req.body.id,new Date(),oldTask.endDate,days+':'+hours+':'+minutes+':'+seconds);
    await request.query(`UPDATE [dbo].[Task] SET [duration]='${days+':'+hours+':'+minutes+':'+seconds}' WHERE id=${req.body.oldTask}`);
    // await request.query(`UPDATE [dbo].[Machine] SET [taskNumber]='${req.body.taskId.join(',')}' WHERE id=${req.body.machineId}`);
    // await request.query(`UPDATE [dbo].[Machine] SET [taskNumber]='${req.body.taskIDsBefore.join(',')}' WHERE id=${req.body.machineIdBefore}`);
    res.json('Deleted successfully')
}




//display sing in page 
module.exports.logIn= async (req, res) => {
                     console.log(req.body);
    const { email, password } = req.body;
    //db connection
    let dbconfig = await sql.connect(config)
    //find user in db 
    const user = await sql.query(`select * from [dbo].[user] where userName = '${email}'`)
    //check if user user not found 
    if (user.recordset.length == 0) {
     
        res.json("user doesn't exist")

      }
    
    else {
      
       let match = await bcrypt.compare(password,user.recordset[0].password.trim())

      if (match) {
        req.session.email = user.recordset[0].userName
        req.session.isLoggedIn = true;
        console.log(res);

        res.json("done")
       
       
      }

      else {
        res.json("WRONG PASSWORD")

      }

    }
    

}




