/* Hackathon '18: What up with these goddamn timezones?! */

const colors = require("colors");
const knex = require("knex");
const moment = require("moment-timezone");
const Table = require("easy-table");

// variety of times across zones
const local = moment();
const lambda = local.clone().tz("UTC");
const seattle = local.clone().tz("America/Los_Angeles")
const houston = local.clone().tz("America/Chicago")
const native = new Date()

const printTwice = (label, data) => {
    // once in a readable format (for us humans)
    console.log(`${label}:`);
    console.log(Table.print(data).bold.yellow);
    // and once in a parseable format (for the toasters)
    console.log(`<<${label}>>`, JSON.stringify(data));
};

printTwice('Environment variables', process.env);

if (process.env.ENV_TZ_OVERRIDE) {
    process.env.TZ = process.env.ENV_TZ_OVERRIDE;
}

// print them all as a baseline
printTwice('Baseline timezones', {
    native: native,
    localtime: local.format('YYYY-MM-DD HH:mm:ss zz'),
    lambda: lambda.format('YYYY-MM-DD HH:mm:ss zz'),
    seattle: seattle.format('YYYY-MM-DD HH:mm:ss zz'),
    houston: houston.format('YYYY-MM-DD HH:mm:ss zz'),
});

// establish db connection
let db = knex({
    client: 'mysql',
    connection: {
        host: 'db',
        // port: '3306',
        user: 'root',
        database: 'test',
    },
    pool: {
        afterCreate: (connection, callback) => {
            if (process.env.SESSION_TZ == 'js') {
                connection.query('SET time_zone = "'+process.env.TZ+'";', (err) => {
                    callback(err, connection);
                });
            }
            else if (process.env.SESSION_TZ == 'db') {
                connection.query('SET time_zone = "'+process.env.MYSQL_TZ+'";', (err) => {
                    callback(err, connection);
                });
            }
            else {
                callback(null, connection);
            }
        }
    }
})

db.column(
    db.raw('@@global.time_zone as global_tz'),
    db.raw('@@session.time_zone as session_tz'),
    db.raw('@@system_time_zone as system_tz')
)
.then((result) => {
    printTwice('Database timezones', result[0]);
    let perm = [process.env.TZ, process.env.MYSQL_TZ, process.env.SESSION_TZ].join(":");
    return db('test_stamps').insert([
        { permutation: `${perm}:local`, stamped: local.format('YYYY-MM-DD HH:mm:ss'), stringed: local.format('YYYY-MM-DD HH:mm:ss') },
        { permutation: `${perm}:lambda`, stamped: lambda.format('YYYY-MM-DD HH:mm:ss'), stringed: lambda.format('YYYY-MM-DD HH:mm:ss') },
        { permutation: `${perm}:seattle`, stamped: seattle.format('YYYY-MM-DD HH:mm:ss'), stringed: seattle.format('YYYY-MM-DD HH:mm:ss') },
        { permutation: `${perm}:houston`, stamped: houston.format('YYYY-MM-DD HH:mm:ss'), stringed: houston.format('YYYY-MM-DD HH:mm:ss') },
        { permutation: `${perm}:now`, stamped: db.raw('NOW()'), stringed: db.raw('NOW()') },
        { permutation: `${perm}:native`, stamped: native, stringed: native },
    ]);
})
.then(() => {
    console.log('Fetching test data...');
    return db('test_stamps').select();
})
.then((result) => {
    printTwice('Inserted data', result);
    process.exit();
})
