// here we do all functionality that sends requests to the api and retrive data so we can send it to the frontend and show it in a user
// interface 
const appRoutes = require('express').Router(); //call for Router method inside express module to give access for any endpoint
const e = require('cors');
const sql = require('mssql')//call for using sql module
let mssql = require('../configuration/mssql-pool-management.js')
const config = require('../Configuration/config')//call for using configuration module that we create it to store database conaction
// const bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
async function startTimer(newTask,id){
    let sqlPool = await mssql.GetCreateIfNotExistPool(config)
    let request = new sql.Request(sqlPool)
    let newEndDate=new Date()
    newEndDate.setDate(newEndDate.getDate() - parseInt(newTask.duration.split(':')[0]))
    newEndDate.setHours(newEndDate.getHours() - parseInt(newTask.duration.split(':')[1]))
    newEndDate.setMinutes(newEndDate.getMinutes() - parseInt(newTask.duration.split(':')[2]))
    newEndDate.setSeconds(newEndDate.getSeconds() - parseInt(newTask.duration.split(':')[3]))
    
    await request.query(`UPDATE [dbo].[Task] SET [endDate]='${new Date(newEndDate).toISOString()}' WHERE id=${newTask.id}`);
}
async function pauseTimer(oldTask,id){
    let sqlPool = await mssql.GetCreateIfNotExistPool(config)
    let request = new sql.Request(sqlPool)  
    var seconds = Math.floor(((new Date().getTime()) - (new Date(oldTask.endDate).getTime()))/1000);
    var minutes = Math.floor(seconds/60);
    var hours = Math.floor(minutes/60);
    var days = Math.floor(hours/24);
    hours = hours-(days*24);
    minutes = minutes-(days*24*60)-(hours*60);
    seconds = seconds-(days*24*60*60)-(hours*60*60)-(minutes*60);
    await request.query(`UPDATE [dbo].[Task] SET [duration]='${days+':'+hours+':'+minutes+':'+seconds}' WHERE id=${oldTask.id}`);
}
module.exports.permissionTimeOut = async (req, res) => {
    let sqlPool = await mssql.GetCreateIfNotExistPool(config)
    let request = new sql.Request(sqlPool)
    let permissionId=await (await request.query(`select max(responseID) from permissionResponse`)).recordset[0][''];
    await request.query(`UPDATE [dbo].[permissionResponse] SET [responseStatues]='false' WHERE [responseID]=${permissionId}`);
    
}
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
module.exports.permissionResponse = async (req, res) => {
    let sqlPool = await mssql.GetCreateIfNotExistPool(config)
    let request = new sql.Request(sqlPool)
    await request.query(`
    INSERT INTO [dbo].[permissionResponse]
         ([responseMessage]
        ,[username]
        ,[responseType]
        ,[responseTime]
        ,[responseStatues]
        )
    VALUES
         ('${req.body.responseMessage}'
         ,'${req.body.username}'
         ,'${req.body.responseType}'
         ,GETDATE()	
         ,'${req.body.responseStatues}'
         )
    `);
    res.json('inserted successfully')
}
module.exports.getPermissionResponse = async (req, res) => {
    let sqlPool = await mssql.GetCreateIfNotExistPool(config)
    let request = new sql.Request(sqlPool)
    let data = await request.query(`select * from permissionResponse where username='${req.body.username}'`);
    console.log(`select * from permissionResponse where username='${req.body.username}'`);
    res.json(data.recordset)
}
module.exports.addPermission = async (req, res) => {
    let sqlPool = await mssql.GetCreateIfNotExistPool(config)
    let request = new sql.Request(sqlPool)

    await request.query(`
    INSERT INTO [dbo].[Permission]
           ([permissionItemId]
           ,[reason]
           ,[startTime]
           ,[duration]
           ,[type]
           ,[username]
           ,[submitted])
     VALUES
           ('${req.body.permissionItemId}'
           ,'${req.body.reason}'
           ,GETDATE()	
           ,'${req.body.duration}'
           ,'${req.body.type}'
           ,'${req.body.username}'
           ,'TRUE')

    `);
    
    res.json('inserted successfully')
}
module.exports.checkUser = async (req, res) => {
    let sqlPool = await mssql.GetCreateIfNotExistPool(config)
    let request = new sql.Request(sqlPool)
    try {
        let data=await request.query(`select userName from addUser where userName='${req.body.userName}'`);
        res.json(data.recordset)

    } catch (error) {
        res.json("error")
        
    }
}
module.exports.addUser = async (req, res) => {
    let sqlPool = await mssql.GetCreateIfNotExistPool(config)
    let request = new sql.Request(sqlPool)
//     bcrypt.hash(req.body.password,8, async function (err, hash) {
//     await request.query(`

//     INSERT INTO [dbo].[users]
//     ([userName]
//     ,[password]
//     ,[userCheckBox]
//     ,[machineCheckBox]
//     ,[taskCheckBox]
//     ,[reportCheckBox]
//     ,[permissionCheckBox])
// VALUES
//     ('${req.body.userName}'
//     ,'${hash}'
//     ,'${req.body.checkbox0}'
//     ,'${req.body.checkbox1}'
//     ,'${req.body.checkbox2}'
//     ,'${req.body.checkbox3}'
//     ,'${req.body.checkbox4}')
//     `);
    

//     res.json('inserted successfully')
// });
}
module.exports.importTasks = async (req, res) => {
    let sqlPool = await mssql.GetCreateIfNotExistPool(config)
    let request = new sql.Request(sqlPool)
    let date=new Date().getTime();
    let tasksOrder;
    date += ((req.body.TaskDurationH*60*60*1000)+(req.body.TaskDurationM*60*1000))

    await request.query(`
    INSERT INTO [dbo].[Task]
    ([customerName]
       ,[customerCode]
       ,[orderReference]
       ,[orderStatus]
       ,[orderNumber]
       ,[orderTypeCode]
       ,[orderTypeName]
       ,[orderPriority]
       ,[orderTotalAmount]
       ,[orderSheets]
       ,[piecesPerSheets]
       ,[piecePrice]
       ,[totalPieces]
       ,[sheetPrice]
       ,[paperType]
       ,[leatherType]
       ,[CNC]
       ,[CTB]
       ,[stamp]
       ,[stepCode]
       ,[stepName]
       ,[stepFactor]
       ,[startDate]
       ,[machineId]
       ,[machinePath]
       ,[status]
       ,[duration]
        )
        VALUES
              (
               '${req.body.CustomerName}',
               '${req.body.CustomerCode}',
               '${req.body.OrderReference}',
               '${req.body.OrderStatus}',
               ${req.body.OrderNumber},
               '${req.body.OrderTypeCode}',
               '${req.body.OrderTypeName}',
               '${req.body.OrderPriority}',
               ${req.body.OrderTotalAmount},
               ${req.body.OrderSheets},
               ${req.body.PiecesPreSheets},
               ${req.body.PiecePrice},
               ${req.body.TotalPieces},
               ${req.body.SheetPrice},
               '${req.body.PaperType}',
               '${req.body.LeatherType}',
               '${req.body.CNC}',
               '${req.body.CTB}',
               '${req.body.Stamp}',
               '${req.body.StepCode}',
               '${req.body.StepName}',
               '${req.body.StepFactor}',
               '${new Date().toISOString()}',
               '1',
               '${req.body.MachinePath}',
               'false',
               '0:0:0:0'
              )
    `);
    let taskId=await (await request.query(`select max(id) from Task`)).recordset[0][""]

    if (await (await request.query(`select taskNumber from Machine where id=1`)).recordset[0].taskNumber==null || await (await request.query(`select taskNumber from Machine where id=1`)).recordset[0].taskNumber=='') 
        tasksOrder=taskId
    else

        tasksOrder=await (await request.query(`select taskNumber from Machine where id=1`)).recordset[0].taskNumber+","+taskId
    await request.query(`UPDATE [dbo].[Machine] SET [taskNumber]='${tasksOrder}' WHERE id=1`);
    res.json('inserted successfully')
}
module.exports.editOrder = async (req, res) => {
    let sqlPool = await mssql.GetCreateIfNotExistPool(config)
    let request = new sql.Request(sqlPool)
    let date=new Date().getTime();

    await request.query(`
    
    UPDATE [dbo].[Task]
    SET [customerName] = '${req.body.CustomerName}'
       ,[customerCode] = '${req.body.CustomerCode}'
       ,[orderReference] = '${req.body.OrderReference}'
       ,[orderStatus] = '${req.body.OrderStatus}'
       ,[orderNumber] = ${req.body.OrderNumber}
       ,[orderTypeCode] = '${req.body.OrderTypeCode}'
       ,[orderTypeName] = '${req.body.OrderTypeName}'
       ,[orderPriority] = '${req.body.OrderPriority}'
       ,[orderTotalAmount] = ${req.body.OrderTotalAmount}
       ,[orderSheets] = ${req.body.OrderSheets}
       ,[piecesPerSheets] = ${req.body.PiecesPreSheets}
       ,[piecePrice] = ${req.body.PiecePrice}
       ,[totalPieces] = ${req.body.TotalPieces}
       ,[sheetPrice] = ${req.body.SheetPrice}
       ,[paperType] = '${req.body.PaperType}'
       ,[leatherType] = '${req.body.LeatherType}'
       ,[CNC] = '${req.body.CNC}'
       ,[CTB] = '${req.body.CTB}'
       ,[stamp] = '${req.body.Stamp}'
       ,[stepCode] = '${req.body.StepCode}'
       ,[stepName] = '${req.body.StepName}'
       ,[stepFactor] = '${req.body.StepFactor}'
       ,[machineId] = '1'
       ,[machinePath] ='${req.body.MachinePath}'
    `);

    let taskId=await (await request.query(`select max(id) from Task`)).recordset[0][""]

    if (await (await request.query(`select taskNumber from Machine where id=1`)).recordset[0].taskNumber==null || await (await request.query(`select taskNumber from Machine where id=1`)).recordset[0].taskNumber=='') 
        tasksOrder=taskId
    else

        tasksOrder=await (await request.query(`select taskNumber from Machine where id=1`)).recordset[0].taskNumber+","+taskId
    await request.query(`UPDATE [dbo].[Machine] SET [taskNumber]='${tasksOrder}' WHERE id=1`);
    res.json('inserted successfully')
}
module.exports.importItem = async (req, res) => {
    let sqlPool = await mssql.GetCreateIfNotExistPool(config)
    let request = new sql.Request(sqlPool)

    await request.query(`
    INSERT INTO [dbo].[Items]
           ([itemName]
           ,[itemPrice])
     VALUES
           ('${req.body.itemName}'
           ,${req.body.itemPrice})
    `);
    
    res.json('inserted successfully')
}
module.exports.importCustomer = async (req, res) => {
    let sqlPool = await mssql.GetCreateIfNotExistPool(config)
    let request = new sql.Request(sqlPool)

    await request.query(`

INSERT INTO [dbo].[Customers]
           ([customerName]
            ,[customerCode])
     VALUES
           ('${req.body.customerName}',
           '${req.body.customerCode}'
           )
    `);
    
    res.json('inserted successfully')
}
module.exports.getMachine = async (req, res) => {
    let sqlPool = await mssql.GetCreateIfNotExistPool(config)
    let request = new sql.Request(sqlPool)
    let data=await request.query(`select * from Machine`);
    res.json(data.recordset)
}
module.exports.getCustomers = async (req, res) => {
    let sqlPool = await mssql.GetCreateIfNotExistPool(config)
    let request = new sql.Request(sqlPool)
    let data=await request.query(`select * from Customers`);
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
                const splitteTaskNumber=machineData.recordset[j].taskNumber.split(',')
                for (let k = 0; k < splitteTaskNumber.length; k++) {
                    if (splitteTaskNumber[k]==taskData.recordset[i].id) {
                        allData[machineId[j]][splitteTaskNumber.indexOf(splitteTaskNumber[k])]= await taskData.recordset[i]
                    }
                }
                // allData[machineId[j]].push(taskData.recordset[i])
                // delete allData.machineId
            }
        }
    }
    for (let i = 0; i < Object.keys(allData).length; i++) {
        for (let j = 0; j < allData[Object.keys(allData)[i]].length; j++) {
            if (allData[Object.keys(allData)[i]][j]==undefined)
                allData[Object.keys(allData)[i]].splice(j,1) 
        }
    }
    res.json(allData)
}
module.exports.getTasksRight = async (req, res) => {
    let sqlPool = await mssql.GetCreateIfNotExistPool(config)
    let request = new sql.Request(sqlPool)
    let data=await request.query(`select * from Task`);
    res.json(data.recordset)
}
module.exports.getPermissions = async (req, res) => {
    let sqlPool = await mssql.GetCreateIfNotExistPool(config)
    let request = new sql.Request(sqlPool)
    let data=await request.query(`select * from Permission`);
    res.json(data.recordset)
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
    if (req.body.previousContainer==req.body.container) {
        if (req.body.previousIndex!=req.body.currentIndex) {
            let machineTaskId=await (await request.query(`select taskNumber from Machine where id=${req.body.container}`)).recordset[0];
            let newTask=await (await request.query(`select * from Task where id=${machineTaskId.taskNumber.split(',')[req.body.previousIndex]}`)).recordset[0];
            let oldTask=await (await request.query(`select * from Task where id=${machineTaskId.taskNumber.split(',')[req.body.currentIndex]}`)).recordset[0];
            pauseTimer(oldTask)
            startTimer(newTask)
        }
    }
    else{
        let machineOldTaskId=await (await request.query(`select taskNumber from Machine where id=${req.body.previousContainer}`)).recordset[0];
        let machineNewTaskId=await (await request.query(`select taskNumber from Machine where id=${req.body.container}`)).recordset[0];
        if (req.body.previousIndex==0&&req.body.currentIndex==0) {
            console.log("0=>0");
            let oldTask;
            let newTask;
            console.log(machineOldTaskId.taskNumber.split(','));
            console.log(machineNewTaskId.taskNumber.split(','));
            if (machineOldTaskId.taskNumber.split(',').length>1){
                console.log("Started");
                console.log(`select * from Task where id=${machineOldTaskId.taskNumber.split(',')[1]}`);
                oldTask=await (await request.query(`select * from Task where id=${machineOldTaskId.taskNumber.split(',')[1]}`)).recordset[0];
                startTimer(oldTask)
            }
            if (machineNewTaskId.taskNumber.split(',').length>0&&machineNewTaskId.taskNumber.split(',')[0]!=""){
                console.log("Paused");
                console.log(`select * from Task where id=${machineNewTaskId.taskNumber.split(',')[0]}`);
                newTask=await (await request.query(`select * from Task where id=${machineNewTaskId.taskNumber.split(',')[0]}`)).recordset[0];
                pauseTimer(newTask)
            }
        }
        else if(req.body.previousIndex!=0&&req.body.currentIndex==0){
            console.log("!0=>0");
            let oldTask;
            let newTask;
            console.log(machineOldTaskId.taskNumber.split(','));
            console.log(machineNewTaskId.taskNumber.split(','));
            console.log(`select * from Task where id=${machineOldTaskId.taskNumber.split(',')[req.body.previousIndex]}`);
            oldTask=await (await request.query(`select * from Task where id=${machineOldTaskId.taskNumber.split(',')[req.body.previousIndex]}`)).recordset[0];
            startTimer(oldTask)
            if (machineNewTaskId.taskNumber.split(',').length>0&&machineNewTaskId.taskNumber.split(',')[0]!=""){
                console.log(`select * from Task where id=${machineNewTaskId.taskNumber.split(',')[0]}`);
                newTask=await (await request.query(`select * from Task where id=${machineNewTaskId.taskNumber.split(',')[0]}`)).recordset[0];
                pauseTimer(newTask)
            }
        }
        else if(req.body.previousIndex==0&&req.body.currentIndex!=0){
            console.log("0=>!0");
            let oldTask;
            let newTask;
            console.log(machineOldTaskId.taskNumber.split(','));
            console.log(machineNewTaskId.taskNumber.split(','));
            if (machineOldTaskId.taskNumber.split(',').length>1){
                console.log(`Started`);
                console.log(`select * from Task where id=${machineOldTaskId.taskNumber.split(',')[1]}`);
                oldTask=await (await request.query(`select * from Task where id=${machineOldTaskId.taskNumber.split(',')[1]}`)).recordset[0];
                startTimer(oldTask)
            }
            if (machineNewTaskId.taskNumber.split(',').length>0&&machineNewTaskId.taskNumber.split(',')[0]!=""){
                console.log(`Pasued`);
                console.log(`select * from Task where id=${machineOldTaskId.taskNumber.split(',')[0]}`);
                newTask=await (await request.query(`select * from Task where id=${machineOldTaskId.taskNumber.split(',')[0]}`)).recordset[0];
                pauseTimer(newTask)
            }
        }
    }
    res.json('Deleted successfully')
}
module.exports.logIn= async (req, res) => {
                     console.log(req.body);
    const { email, password } = req.body;
    //db connection
    let dbconfig = await sql.connect(config)
    //find user in db 
    const user = await sql.query(`select * from [dbo].[users] where userName = '${email}'`)
    //check if user user not found 
    if (user.recordset.length == 0) {
     
        res.json("user doesn't exist")

      }
    
     else {
      
    //    let match = await bcrypt.compare(password,user.recordset[0].password.trim())

    //   if (match) {
        var token = jwt.sign({ user:user.recordset }, 'gowdat');
        
        
        res.json({token,message:"done"})
       
       
      }

    //   else {
    //     res.json("WRONG PASSWORD")

    //   }

    // }
    

}
module.exports.start = async (req, res) => {
    let sqlPool = await mssql.GetCreateIfNotExistPool(config)
    let request = new sql.Request(sqlPool)
    let newTask=await (await request.query(`select * from Task where id=${req.body.id}`)).recordset[0];
    startTimer(newTask,req.body.id)
    await request.query(`UPDATE [dbo].[Machine] SET [status]='true' WHERE id=${newTask.machineId}`);
    res.json('Timer has started')
}
module.exports.stop = async (req, res) => {
    let sqlPool = await mssql.GetCreateIfNotExistPool(config)
    let request = new sql.Request(sqlPool)
    let oldTask=await (await request.query(`select * from Task where id=${req.body.id}`)).recordset[0];
    pauseTimer(oldTask,req.body.id)
    await request.query(`UPDATE [dbo].[Machine] SET [status]='false' WHERE id=${oldTask.machineId}`);
    res.json('Timer has paused')
}
module.exports.startTask = async (req, res) => {
    let sqlPool = await mssql.GetCreateIfNotExistPool(config)
    let request = new sql.Request(sqlPool)
    let newTask=await (await request.query(`select * from Task where id=${req.body.id}`)).recordset[0];
    startTimer(newTask,req.body.id)
    await request.query(`UPDATE [dbo].[Task] SET [status]='true' WHERE id=${req.body.id}`);
    res.json('Timer has started')
}
module.exports.stopTask = async (req, res) => {
    let sqlPool = await mssql.GetCreateIfNotExistPool(config)
    let request = new sql.Request(sqlPool)
    let oldTask=await (await request.query(`select * from Task where id=${req.body.id}`)).recordset[0];
    pauseTimer(oldTask,req.body.id)
    await request.query(`UPDATE [dbo].[Task] SET [status]='false' WHERE id=${req.body.id}`);
    res.json('Timer has paused')
}
module.exports.viewTask = async (req, res) => {
    let sqlPool = await mssql.GetCreateIfNotExistPool(config)
    let request = new sql.Request(sqlPool)
    let task;
    if(req.body.id==0)
        task=await (await request.query(`select TOP (1) * from Task`)).recordset[0];
    else
        task=await (await request.query(`select * from Task where id=${req.body.id}`)).recordset[0];
    res.json(task)
}
module.exports.stopMachine = async (req, res) => {
    let sqlPool = await mssql.GetCreateIfNotExistPool(config)
    let request = new sql.Request(sqlPool)
    let machine=await (await request.query(`select * from Machine where id=${req.body.id}`)).recordset[0];
    if (machine.taskNumber==""||machine.taskNumber==null) {
        await request.query(`UPDATE [dbo].[Machine] SET [status]='false' WHERE id=${req.body.id}`);
    }
    else{
        let task=await (await request.query(`select * from task where id=${machine.taskNumber.includes(',')?machine.taskNumber.split(',')[0]:machine.taskNumber}`)).recordset[0];
        pauseTimer(task,task.id)
        console.log(task);
        await request.query(`UPDATE [dbo].[Machine] SET [status]='false' WHERE id=${task.machineId}`);
    }
    res.json('Timer has paused')
}
module.exports.startMachine = async (req, res) => {
    let sqlPool = await mssql.GetCreateIfNotExistPool(config)
    let request = new sql.Request(sqlPool)
    let machine=await (await request.query(`select * from Machine where id=${req.body.id}`)).recordset[0];
    if (machine.taskNumber==""||machine.taskNumber==null) {
        await request.query(`UPDATE [dbo].[Machine] SET [status]='true' WHERE id=${req.body.id}`);
    }
    else{
        let task=await (await request.query(`select * from task where id=${machine.taskNumber.includes(',')?machine.taskNumber.split(',')[0]:machine.taskNumber}`)).recordset[0];
        pauseTimer(task,task.id)
        console.log(task);
        await request.query(`UPDATE [dbo].[Machine] SET [status]='true' WHERE id=${task.machineId}`);
    }
    res.json('Timer has paused')
}
module.exports.submittedColumn = async (req, res) => {
    let sqlPool = await mssql.GetCreateIfNotExistPool(config)
    let request = new sql.Request(sqlPool)
    await request.query(`UPDATE [dbo].[Permission] SET [submitted]='FALSE' WHERE permissionId=${req.body.permissionId}`);
    res.json('Permission is deleted')

}
module.exports.addOrder = async (req, res) => {
    let sqlPool = await mssql.GetCreateIfNotExistPool(config)
    let request = new sql.Request(sqlPool)
    await request.query(`UPDATE [dbo].[Permission] SET [submitted]='FALSE' WHERE permissionId=${req.body.permissionId}`);
    res.json('Permission is deleted')
}
// jwt.verify(token,'gowdat',(err,decodded)=>{
//     if(err){
//         res.json('err')
//     }
//     else {
//  console.log(decodded)
//          res.json({message : 'success'})
//     }
//     console.log(decodded)
// })