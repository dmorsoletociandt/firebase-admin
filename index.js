const { initializeApp } = require("firebase-admin/app");
const { getFirestore, Timestamp, FieldValue, Filter } = require('firebase-admin/firestore');

async function main() {
    args = getArgs()

    const db = getFirestore();
    if (args.env === 'local') {
        db.settings({
            projectId: "bexs-test",
            host: "localhost:8080",
            ssl: false
        })
    }

    switch (args.action) {
        case "get":
            await getDocuments(db);
            break;

        case "getById":
            const id = args.id
            if (!id) {
                console.error('id is required');
                return;
            }
            await getDocumentsById(db, id);
            break;

        case "delete":
            await deleteDocuments(db);
            break;

        default:
            await getDocuments(db);
            break;
    }
}

async function getDocuments(db) {
    const docSnaps = await db.collection('FXCurrencyCost').where("expiration_date", ">=", new Date("2023-08-09T00:00:00.000Z")).where("is_active", "==", true).get();
    // const docSnaps = await db.collection('FXCurrencyCost').where("expiration_date", ">=", new Date("2023-08-09T00:00:00.000Z")).get();
    console.log(docSnaps.docs.length);
    for (let index = 0; index < docSnaps.docs.length; index++) {
        const doc = docSnaps.docs[index];
        console.log(doc.data());
    }
}

async function getDocumentsById(db, id) {
    const docSnaps = await db.collection('FXCurrencyCost').doc('' + id).get();
    const expirationDate = docSnaps.data().expiration_date.toDate()
    console.log(docSnaps.data());
    console.log(expirationDate);
}

async function deleteDocuments(db) {
    const docSnaps = await db.collection('FXCurrencyCost').where("expiration_date", ">=", new Date("2023-08-08T00:00:00.000Z")).get();
    // const docSnaps = await db.collection('FXCurrencyCost').where("created_by", ">=", new Date("2023-08-08T00:00:00.000Z")).get();
    console.log(docSnaps.docs.length);
    for (let index = 0; index < docSnaps.docs.length; index++) {
        const doc = docSnaps.docs[index];
        // console.log(doc.id);
        const res = await db.collection('FXCurrencyCost').doc(doc.id).delete();
        console.log(res);
    }
}

function getArgs() {
    const args = {};
    process.argv
        .slice(2, process.argv.length)
        .forEach(arg => {
            // long arg
            if (arg.slice(0, 2) === '--') {
                const longArg = arg.split('=');
                const longArgFlag = longArg[0].slice(2, longArg[0].length);
                const longArgValue = longArg.length > 1 ? longArg[1] : true;
                args[longArgFlag] = longArgValue;
            }
            // flags
            else if (arg[0] === '-') {
                const flags = arg.slice(1, arg.length).split('');
                flags.forEach(flag => {
                    args[flag] = true;
                });
            }
        });
    return args;
}

initializeApp({
    projectId: 'fx-develop',
});
main();