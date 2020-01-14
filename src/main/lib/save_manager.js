import { readdir, readFile } from 'fs'
import { join } from 'path'
import { promisify } from 'util'
import jsZip from 'jszip'

import store from '@lib/store'
import log from './logger'

export default class SaveManager {
  async retrieveFactorioSaves () {
    log.debug('Entered function', { namespace: 'main.save_manager.retrieveFactorioSave' })

    const savesPath = store.get('paths.saves')
    if (!savesPath) {
      log.error('Path to the saves folder was not set when trying to retrieve saves', { namespace: 'main.save_manager.retrieveFactorioSave' })
      throw new Error('Unable to get saves info as the saves path has not been set.')
    }

    const saves = []

    try {
      const savesInDirectory = await promisify(readdir)(savesPath, 'utf8')
      saves.push(...await Promise.all(savesInDirectory
        .filter(filename => filename.endsWith('.zip'))
        .map(async (save) => {
          const buffer = await promisify(readFile)(join(savesPath, save))
          const zip = await jsZip.loadAsync(buffer)

          const previewFile = await zip.file(/preview\.(jpg)|(png)/)[0]
          const imageDataUrl = previewFile
            ? `data:image/${previewFile.name.endsWith('.png') ? 'png' : 'jpeg'};base64,${await previewFile.async('base64')}`
            : ''

          if (save === 'Seablock Babieeee.zip') {
            const levelFile = await (await zip.file(/level\.dat/)[0]).async('nodebuffer')
            console.log(await this.parseLevelData(levelFile))
          }

          return {
            name: save.slice(0, save.indexOf('.zip')),
            preview: imageDataUrl,
          }
        })
      ))

      log.info(`Saves have been parsed. Save count: ${saves.length}`, { namespace: 'main.save_manager.retrieveFactorioSave' })
    } catch (error) {
      log.error(`Error when loading saves: ${error.message}`, { namespace: 'main.save_manager.retrieveFactorioSave' })
    }

    log.debug('Leaving function', { namespace: 'main.save_manager.retrieveFactorioSave' })
    return saves
  }

  async parseLevelData (levelData) {
    // Yeah not actually sure about version, this is a guess
    // const version = levelData.readUIntBE(2, 1)
    const [vMajor, vMinor, vPatch, vBuild] = [...Array(4)].map((_, i) => levelData.readUIntBE(i, 1))

    // const something = levelData.readUIntBE(4, 1)

    const lenCampaign = levelData.readUIntBE(10, 1)
    const campaign = levelData.toString('utf-8', 11, 11 + lenCampaign)

    // let startPos = 0
    // if (version === '0.16') startPos = 48
    // if (version === '0.17') startPos = 33
    //
    // const modCount = levelData.readUIntBE(startPos, 1)
    //
    // const mods = []
    // for (let i = modCount, pos = startPos + 4; i > 0; i--) {
    //   const length = levelData.readUIntBE(pos, 1)
    //
    //   const modName = levelData.toString('utf-8', pos + 1, pos + length + 1)
    //   mods.push(modName)
    //
    //   pos += length + 4
    // }

    console.log('output 1 |', [vMajor, vMinor, vPatch, vBuild])
    console.log('output 2 |', lenCampaign, '|', campaign)

    console.log('base mod |', levelData.toString('utf-8', 20, 23 + 1))

    console.log('seablock, maybe |', levelData.toString('utf-8', 38, 58))

    for (let byte = 1; byte < 5; byte++) {
      console.log(`\n ===== going by ${byte} ===== \n`)
      for (let i = 4; i < 100; i++) {
        console.log(i, ':', levelData.readUIntBE(i, 1))
      }
    }

    // return modCount
  }
}

// Current mod set for save
// A Sea Block Config
// angelsaddons-warehouses
// angelsbioprocessing
// angelspetrochem
// angelsrefining
// angelssmelting
// bobassembly
// bobelectronics
// bobenemies
// bobequipment
// bobinserters
// boblibrary
// boblogistics
// bobmining
// bobmodules
// bobplates
// bobpower
// bobrevamp
// bobtech
// bobwarfare
// CircuitProcessing
// Explosive Excavation
// FNEI
// KS
// LandfillPainting
// Nuclear Fuel
// ScienceCostTweakerM
// SeaBlock
// SeaBlockMetaPack
// SpaceMod

// DUMP OUTPUT FROM THIS
// for (let byte = 1; byte < 5; byte++) {
//   console.log(`\n ===== going by ${byte} ===== \n`)
//   for (let i = 4; i < 100; i++) {
//     console.log(i, ':', levelData.readUIntBE(i, 1))
//   }
// }

// ===== going by 1 =====
//
// 4 : 79
// 5 : 0
// 6 : 0
// 7 : 0
// 8 : 0
// 9 : 0
// 10 : 8
// 11 : 102
// 12 : 114
// 13 : 101
// 14 : 101
// 15 : 112
// 16 : 108
// 17 : 97
// 18 : 121
// 19 : 4
// 20 : 98
// 21 : 97
// 22 : 115
// 23 : 101
// 24 : 1
// 25 : 0
// 26 : 0
// 27 : 0
// 28 : 0
// 29 : 0
// 30 : 0
// 31 : 1
// 32 : 0
// 33 : 17
// 34 : 79
// 35 : 249
// 36 : 186
// 37 : 1
// 38 : 31
// 39 : 18
// 40 : 65
// 41 : 32
// 42 : 83
// 43 : 101
// 44 : 97
// 45 : 32
// 46 : 66
// 47 : 108
// 48 : 111
// 49 : 99
// 50 : 107
// 51 : 32
// 52 : 67
// 53 : 111
// 54 : 110
// 55 : 102
// 56 : 105
// 57 : 103
// 58 : 0
// 59 : 3
// 60 : 0
// 61 : 162
// 62 : 56
// 63 : 102
// 64 : 239
// 65 : 17
// 66 : 67
// 67 : 105
// 68 : 114
// 69 : 99
// 70 : 117
// 71 : 105
// 72 : 116
// 73 : 80
// 74 : 114
// 75 : 111
// 76 : 99
// 77 : 101
// 78 : 115
// 79 : 115
// 80 : 105
// 81 : 110
// 82 : 103
// 83 : 0
// 84 : 2
// 85 : 1
// 86 : 49
// 87 : 89
// 88 : 153
// 89 : 238
// 90 : 20
// 91 : 69
// 92 : 120
// 93 : 112
// 94 : 108
// 95 : 111
// 96 : 115
// 97 : 105
// 98 : 118
// 99 : 101
//
// ===== going by 2 =====
//
// 4 : 79
// 5 : 0
// 6 : 0
// 7 : 0
// 8 : 0
// 9 : 0
// 10 : 8
// 11 : 102
// 12 : 114
// 13 : 101
// 14 : 101
// 15 : 112
// 16 : 108
// 17 : 97
// 18 : 121
// 19 : 4
// 20 : 98
// 21 : 97
// 22 : 115
// 23 : 101
// 24 : 1
// 25 : 0
// 26 : 0
// 27 : 0
// 28 : 0
// 29 : 0
// 30 : 0
// 31 : 1
// 32 : 0
// 33 : 17
// 34 : 79
// 35 : 249
// 36 : 186
// 37 : 1
// 38 : 31
// 39 : 18
// 40 : 65
// 41 : 32
// 42 : 83
// 43 : 101
// 44 : 97
// 45 : 32
// 46 : 66
// 47 : 108
// 48 : 111
// 49 : 99
// 50 : 107
// 51 : 32
// 52 : 67
// 53 : 111
// 54 : 110
// 55 : 102
// 56 : 105
// 57 : 103
// 58 : 0
// 59 : 3
// 60 : 0
// 61 : 162
// 62 : 56
// 63 : 102
// 64 : 239
// 65 : 17
// 66 : 67
// 67 : 105
// 68 : 114
// 69 : 99
// 70 : 117
// 71 : 105
// 72 : 116
// 73 : 80
// 74 : 114
// 75 : 111
// 76 : 99
// 77 : 101
// 78 : 115
// 79 : 115
// 80 : 105
// 81 : 110
// 82 : 103
// 83 : 0
// 84 : 2
// 85 : 1
// 86 : 49
// 87 : 89
// 88 : 153
// 89 : 238
// 90 : 20
// 91 : 69
// 92 : 120
// 93 : 112
// 94 : 108
// 95 : 111
// 96 : 115
// 97 : 105
// 98 : 118
// 99 : 101
//
// ===== going by 3 =====
//
// 4 : 79
// 5 : 0
// 6 : 0
// 7 : 0
// 8 : 0
// 9 : 0
// 10 : 8
// 11 : 102
// 12 : 114
// 13 : 101
// 14 : 101
// 15 : 112
// 16 : 108
// 17 : 97
// 18 : 121
// 19 : 4
// 20 : 98
// 21 : 97
// 22 : 115
// 23 : 101
// 24 : 1
// 25 : 0
// 26 : 0
// 27 : 0
// 28 : 0
// 29 : 0
// 30 : 0
// 31 : 1
// 32 : 0
// 33 : 17
// 34 : 79
// 35 : 249
// 36 : 186
// 37 : 1
// 38 : 31
// 39 : 18
// 40 : 65
// 41 : 32
// 42 : 83
// 43 : 101
// 44 : 97
// 45 : 32
// 46 : 66
// 47 : 108
// 48 : 111
// 49 : 99
// 50 : 107
// 51 : 32
// 52 : 67
// 53 : 111
// 54 : 110
// 55 : 102
// 56 : 105
// 57 : 103
// 58 : 0
// 59 : 3
// 60 : 0
// 61 : 162
// 62 : 56
// 63 : 102
// 64 : 239
// 65 : 17
// 66 : 67
// 67 : 105
// 68 : 114
// 69 : 99
// 70 : 117
// 71 : 105
// 72 : 116
// 73 : 80
// 74 : 114
// 75 : 111
// 76 : 99
// 77 : 101
// 78 : 115
// 79 : 115
// 80 : 105
// 81 : 110
// 82 : 103
// 83 : 0
// 84 : 2
// 85 : 1
// 86 : 49
// 87 : 89
// 88 : 153
// 89 : 238
// 90 : 20
// 91 : 69
// 92 : 120
// 93 : 112
// 94 : 108
// 95 : 111
// 96 : 115
// 97 : 105
// 98 : 118
// 99 : 101
//
// ===== going by 4 =====
//
// 4 : 79
// 5 : 0
// 6 : 0
// 7 : 0
// 8 : 0
// 9 : 0
// 10 : 8
// 11 : 102
// 12 : 114
// 13 : 101
// 14 : 101
// 15 : 112
// 16 : 108
// 17 : 97
// 18 : 121
// 19 : 4
// 20 : 98
// 21 : 97
// 22 : 115
// 23 : 101
// 24 : 1
// 25 : 0
// 26 : 0
// 27 : 0
// 28 : 0
// 29 : 0
// 30 : 0
// 31 : 1
// 32 : 0
// 33 : 17
// 34 : 79
// 35 : 249
// 36 : 186
// 37 : 1
// 38 : 31
// 39 : 18
// 40 : 65
// 41 : 32
// 42 : 83
// 43 : 101
// 44 : 97
// 45 : 32
// 46 : 66
// 47 : 108
// 48 : 111
// 49 : 99
// 50 : 107
// 51 : 32
// 52 : 67
// 53 : 111
// 54 : 110
// 55 : 102
// 56 : 105
// 57 : 103
// 58 : 0
// 59 : 3
// 60 : 0
// 61 : 162
// 62 : 56
// 63 : 102
// 64 : 239
// 65 : 17
// 66 : 67
// 67 : 105
// 68 : 114
// 69 : 99
// 70 : 117
// 71 : 105
// 72 : 116
// 73 : 80
// 74 : 114
// 75 : 111
// 76 : 99
// 77 : 101
// 78 : 115
// 79 : 115
// 80 : 105
// 81 : 110
// 82 : 103
// 83 : 0
// 84 : 2
// 85 : 1
// 86 : 49
// 87 : 89
// 88 : 153
// 89 : 238
// 90 : 20
// 91 : 69
// 92 : 120
// 93 : 112
// 94 : 108
// 95 : 111
// 96 : 115
// 97 : 105
// 98 : 118
// 99 : 101
