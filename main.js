const fs = require('fs')
const { parse } = require('csv-parse/sync')

produceOrder('20220113_order')

// Assumes energy use output is broken into csv files in subdirectory
function loadEnergyUse(params, locations){

  var files = fs.readdirSync(params.orderFoler+'/'+params.energyUseFolder)

  allRecRecords = []
  for(i=0; i<files.length; i++){
    if(files[i].includes('.csv')){
      fileContents = parse(fs.readFileSync(params.orderFoler+'/'+params.energyUseFolder+'/'+files[i], { encoding: "utf8"}))
      // console.log(fileContents)

      // Loop over rows (REC entries)
      for(j=0; j<fileContents.length; j++){
        thisRow = fileContents[j]

        // A row is real if its first element is a minerID (starts with 'f')
        if (thisRow[0][0] == 'f'){
          // console.log(thisRow)

          totalSealed_GiB_index = 3
          sealingEnergy_upper_MWh_index = 4
          integrated_GiB_hr_index = 5
          storage_upper_integrated_MWh_index = 6
          total_energy_upper_MWh_recalc_index = 7
          REC_purchase_with_margin_index = 8

          if (thisRow.length == 14){
            totalSealed_GiB_index = 4
            sealingEnergy_upper_MWh_index = 5
            integrated_GiB_hr_index = 10
            storage_upper_integrated_MWh_index = 11
            total_energy_upper_MWh_recalc_index = 12
            REC_purchase_with_margin_index = 13
          }

          locationRecords = locations.minerLocations.filter(elem => elem.miner == thisRow[0])

          thisRecord = {
              'minerID' : thisRow[0],
              'location' : locationRecords,
              'start' : thisRow[1],
              'end' : thisRow[2],
              'totalSealed_GiB' : Number(thisRow[totalSealed_GiB_index]),
              'sealingEnergy_upper_MWh' : Number(thisRow[sealingEnergy_upper_MWh_index]),
              'integrated_GiB_hr' : Number(thisRow[integrated_GiB_hr_index]),
              'storage_upper_integrated_MWh' : Number(thisRow[storage_upper_integrated_MWh_index]),
              'total_energy_upper_MWh_recalc' : Number(thisRow[total_energy_upper_MWh_recalc_index]),
              'REC_purchase_with_margin' : Number(thisRow[REC_purchase_with_margin_index]),
              'filename' : files[i],
              'row_index_in_file' : j // Number includes headers and blank rows
          }
          // console.log(thisRecord)
          allRecRecords.push(thisRecord)
        }
      }
    }
  }
  // console.log(locations)
  return allRecRecords
}

function produceOrder(path){

  params = require('./'+path+'/params.json')
  locations = require('./'+path+'/'+params.locations)
  // console.log(locations)
  // console.log(params)

  enUse = loadEnergyUse(params, locations)


}
