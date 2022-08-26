const password = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{6,}$/
/*
(?=.*\d)          // should contain at least one digit
(?=.*[a-z])       // should contain at least one lower case
(?=.*[A-Z])       // should contain at least one upper case
[a-zA-Z0-9]{6,}   // should contain at least 6 from the mentioned characters
*/

const schemas = {
	User: {
		name:"users",
		setup: "create table users (username varchar(12) not null unique primary key, password varchar(60) not null);",
		attrs:{
			username: {type:'string', required:true},
			password: {type: value => password.test(value) && value.length < 24, required:true},
		},
	},
	Task: {
		name:"tasks",
		setup: "create table tasks (id integer not null unique primary key auto_increment, title varchar(256) not null, description text not null, status varchar(12) not null, date varchar(24) not null, comments text, asignee varchar(12));",
		attrs:{
			title: {type:'string', required:true},
			description: {type:'string', required:true},
			status: {type:'string', required:true},
			date: {type: value => !isNaN(new Date(value)), required:true},
			comments: {type: 'string', required:false},
			asignee: {type: 'string', required:false},
		}
	},
	TaskView: {
		name:"briefs",
		setup: "create view briefs as select title, status, date from tasks;",
		attrs:{
			title:true,
			status:true,
			date:true,
		}
	}
}

const builders = {
	User: {
		create: (newUser)=>{
			const errors = {}
			const user = Object.keys(schemas.User.attrs).reduce((_attrs, attr) => {
				const value = newUser[attr]
				const {type, required} = schemas.User.attrs[attr]
				if(required && !value)
					errors[attr] = "required field"
				else if( !(type instanceof Function && type(value) || typeof(value) == type) )
					errors[attr] = "wrong type"
				_attrs[attr] = value
				return _attrs
			}, {})
			return {user, errors}
		}
	},
	Task: {
		create: (newTask) => {
			const errors = {}
			const task = Object.keys(schemas.Task.attrs).reduce((_attrs, attr) => {
				const value = newTask[attr]
				const {type, required} = schemas.Task.attrs[attr]
				if(required && !value)
					errors[attr] = "required field"
				if( !(type instanceof Function && type(value) || typeof(value) == type) )
					errors[attr] = "wrong type"
				else 
					_attrs[attr] = value
				return _attrs
			}, {})
			return {task, errors}
		},
		update: (existingTask, newTask) => {
			const errors = {}
			const task = Object.keys(schemas.Task.attrs).reduce((_attrs, attr) => {
				const value = newTask[attr]
				const {type, required} = schemas.Task.attrs[attr]
				if(value){
					if( !(type instanceof Function && type(value) || typeof(value) == type) )
						errors[attr] = "wrong type"
					else if(`${existingTask[attr]}` != `${value}`)
						_attrs[attr] = value
				}
				return _attrs
			}, {})
			return {task, errors}
		}
	}
}

module.exports = {schemas, builders}