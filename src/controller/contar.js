

const valorfaixa = (array) =>{
    value = 0
    if(array.length > 0){
        for (data of array){
            value+=data.valor
        }
        return value.toFixed(2)

    }
    return value

}


module.exports = { valorfaixa }