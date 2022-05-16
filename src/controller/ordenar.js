const jlinq = require('jlinq')

module.exports = {


    ordenar(array,item) {

        return jlinq.from(array)
            .sort('age', item)
            .select();

    }
}

