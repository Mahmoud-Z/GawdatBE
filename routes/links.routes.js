const appRoutes = require('express').Router();
const controller=require('../controllers/controller')


appRoutes.post("/checkUser", controller.checkUser)
appRoutes.post("/importMachine", controller.importMachine)
appRoutes.post("/addUser", controller.addUser)
appRoutes.get("/getMachine", controller.getMachine)
appRoutes.get("/getTasks", controller.getTasks)
appRoutes.get("/getTasksRight", controller.getTasksRight)
appRoutes.get("/getPermissions", controller.getPermissions)

appRoutes.post("/getPermissionResponse", controller.getPermissionResponse)

appRoutes.post("/permissionTimeOut", controller.permissionTimeOut)


appRoutes.post("/importItem", controller.importItem)
appRoutes.post("/importCustomer", controller.importCustomer)
appRoutes.post("/addPermission", controller.addPermission)
appRoutes.post("/submittedColumn", controller.submittedColumn)
appRoutes.post("/deleteMachine", controller.deleteMachine)
appRoutes.post("/deleteTask", controller.deleteTask)
appRoutes.post("/updateTask", controller.updateTask)
appRoutes.post("/changeTime", controller.changeTime)
appRoutes.post("/logIn",controller.logIn)
appRoutes.post("/start", controller.start)
appRoutes.post("/stop", controller.stop)
appRoutes.post("/viewTask", controller.viewTask)
appRoutes.post("/stopMachine", controller.stopMachine)
appRoutes.post("/startMachine", controller.startMachine)
appRoutes.post("/permissionResponse", controller.permissionResponse)


module.exports = appRoutes;