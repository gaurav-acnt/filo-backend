const GB= 1024 * 1024* 1024;

const plans = {
    FREE:{
        name:"FREE",
        storageLimit:1*GB,
        amount:0,
    },
    PRO_10GB:{
        name:"PRO_10GB",
        // name:"PREMIUM",
        storageLimit: 10*GB,
        amount:99,
    },
    PRO_50GB:{
        name:"PRO_50Gb",
        storageLimit:50*50,
        amount:299,
    }
}

module.exports= {plans};




