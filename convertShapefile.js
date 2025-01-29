const fs = require('fs');
const path = require('path');
const shapefile = require('shapefile');

// Defina o caminho para o seu arquivo .shp
//const shapefilePath = path.join(__dirname, 'uploads', 'PE-2607208-AC496DB43C43418B86901B079BD89BF4', 'Area_do_Imovel', 'Area_do_Imovel.shp');
const shapefilePath = path.join(__dirname, 'static', 'BR_UF_2023', 'BR_UF_2023.shp');

// Defina o caminho para salvar o arquivo GeoJSON
//const outputGeoJSONPath = path.join(__dirname, 'uploads', 'PE-2607208-AC496DB43C43418B86901B079BD89BF4', 'Area_do_Imovel', 'Area_do_Imovel.geojson');
const outputGeoJSONPath = path.join(__dirname, 'static', 'BR_UF_2023', 'BR_UF_2023.geojson');

shapefile.read(shapefilePath)
    .then(geojson => {
        fs.writeFileSync(outputGeoJSONPath, JSON.stringify(geojson));
        console.log('Conversão bem-sucedida! GeoJSON salvo em:', outputGeoJSONPath);
    })
    .catch(error => {
        console.error('Erro ao converter shapefile:', error);
    });
