import { GoogleAIFileManager } from "@google/generative-ai/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY);
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method === 'POST') {
    let uploadedFiles = [];
    const analysisType = req.headers['analysis-type']; // Retrieve the analysis type from headers
    const subPromptType = req.headers['sub-prompt-type']; // Retrieve the sub-prompt type from headers

    const promptType = req.headers['prompt-type']; // Retrieve the prompt type from headers


    try {
      const files = await new Promise((resolve, reject) => {
        const multiparty = require('multiparty');
        const form = new multiparty.Form();
        
        form.parse(req, (error, fields, files) => {
          if (error) reject(error);
          resolve(files);
        });
      });

      if (!files || Object.keys(files).length === 0) {
        res.status(400).json({ result: 'No files uploaded.' });
        return;
      }

      uploadedFiles = await Promise.all(Object.keys(files).map(async (key) => {
        const file = files[key][0];
        const uploadResult = await fileManager.uploadFile(file.path, {
          mimeType: file.headers['content-type'],
          displayName: file.originalFilename,
        });
        return uploadResult.file;
      }));

      // Define prompts based on analysis type
      const prompts = {
        vegetation: 'Use scientific language. At the very top of the images, you will find dates of the incident. Read them clearly and use them when generating the comparison between images (multiple * images). Do not mistake the dates; provide them as they are. Do not provide the location if you do not read it clearly. Provide all dates and specify the dates where fire marks are present OR forestry and vegetation recovery and expansion. Compare all satellite imageries one by one to detect fire and its effects on deforestation OR ferestry expansion and recovery based on what you view on the images . Note: do not write about what you did not see.emphasizing how different regions are affected based on the geographical data provided by the map borders if there is. Finally, generate a report with general recommendations and decision making on what should be done to stop deforestation after the fire incident. Reporting on impact or relevance of observed changes on climate change',
        water: 'Use scientific language. At the very top of the images, you will find dates of the incident. Read them clearly and use them when generating the comparison between images (multiple * images). Do not mistake the dates; provide them as they are. Do not provide the location if you do not read it clearly. Provide all dates and specify the dates where water body marks are present and how it is receding ,Identify areas of increased drought stress in the imageries, in the cases of coastal areas Detect signs of sea-level rise affecting coastal areas. Compare all satellite imageries one by one to detect water bodies and their effects on the region  emphasizing how different regions are affected based on the geographical data provided by the map borders if there is. Note: do not write about what you did not see. Finally, generate a report with general recommendations and decision making on what should be done to stop drought after water receding in water bodies and lakes.Reporting on impact or relevance of observed changes on climate change',
        agriculture: 'Use scientific language. At the very top of the images, you will find dates of the incident. Read them clearly and use them when generating the comparison between images (multiple * images). Do not mistake the dates; provide them as they are. Do not provide the location if you do not read it clearly. Compare all satellite imageries to detect changes in agricultural areas, such as crop patterns, expansion or reduction of cultivated land, and potential effects of natural events on agriculture emphasizing how different regions are affected based on the geographical data provided by the map borders if there is. Finally, generate a report with recommendations on agricultural practices and risk management. Reporting on impact or relevance of observed changes on climate change',
        geology: 'Use scientific language. At the very top of the images, you will find dates of the incident. Read them clearly and use them when generating the comparison between images (multiple * images). Do not mistake the dates; provide them as they are. Do not provide the location if you do not read it clearly. Compare all satellite imageries to detect geological changes, such as landslides, erosion, sediment movement, or tectonic activity emphasizing how different regions are affected based on the geographical data provided by the map borders if there is. Provide a detailed analysis of the geological phenomena observed and recommend possible actions for mitigation or study. Reporting on impact or relevance of observed changes on climate change',
        urban: 'Use scientific language. At the very top of the images, you will find dates of the incident. Read them clearly and use them when generating the comparison between images (multiple *images). Do not mistake the dates; provide them as they are. Do not provide the location if you do not read it clearly. Compare all satellite imageries to detect urban expansion, changes in land use, infrastructure development, or the effects of natural disasters on urban areas. Provide a report on the urban changes observed and emphasizing how different regions are affected based on the geographical data provided by the map borders if there isand suggest urban planning or disaster recovery strategies. Reporting on impact or relevance of observed changes on climate change also recommendations and decision making',
        volcanoes: 'Use scientific language. At the very top of the images, you will find dates of the incident. Read them clearly and use them when generating the comparison between images (multiple * images). Do not mistake the dates; provide them as they are. Do not provide the location if you do not read it clearly. Compare all satellite imageries to detect volcanic activity, lava flow,explosions, ash dispersion, or other volcanic phenomena. Provide a comprehensive report on the volcanic activity observed and its potential impacts emphasizing how different regions are affected based on the geographical data provided by the map borders if there is, along with recommendations for monitoring and response. Reporting on impact or relevance of observed changes on climate change also recommendationsand decision making',
        snow: 'Use scientific language. At the very top of the images, you will find dates of the incident. Read them clearly and use them when generating the comparison between images (multiple * images). Do not mistake the dates; provide them as they are. Do not provide the location if you do not read it clearly. Compare all satellite imageries to detect changes in snow and glacier cover, such as retreat, advance, or seasonal variations. Provide an analysis of the implications for water resources, climate change, and potential risks associated with these changes, along with appropriate recommendations. Reporting on impact or relevance of observed changes on climate change also recommendationsand decision making',
        AER  : 'do not use the word fire in the answer  Use scientific language Compare all satellite imageries one by one  when generating the comparison between images (multiple * images)for a represented coloring of UV absorbing aerosols on a map by sattelite images   It can be used to detect the presence of UV absorbing aerosols such as desert dust and volcanic ash plumes. Positive values (from light blue to red) indicate the presence of UV-absorbing aerosol.use the following values to represent colors in the report  5 is dark red 4.25 is light red 2.75 is yellow 1.25 is light blue -0.25 is blue and -1.0 is dark blue make sure to use places and loation from the map when analysing the sattelite imageries - if you have mostly one major same color on the imageries , try to spot one or more major differences of colors and their assiged value on one or more places emphasizing how different regions are affected based on the geographical data provided by the map borders if there is.finally Reporting on impact or relevance of observed changes on climate change and decision making according to that ',
          CH4: 'Use scientific language to Compare and spot changes all satellite imageries one by one when generating the comparison between images (multiple * images) for a represented coloring of CH4 (Methane) on a map by sattelite images Methane (CH4)Methane is, after carbon dioxide, the most important contributor to the anthropogenically (caused by human activity) enhanced greenhouse effect. Measurements are provided in parts per billion (ppb) with a spatial resolution of 7 km x 3.5 km.use the following values to represent colors[ppb] 1600 dark blue 1650 blue 1750 turquiose 1850 yellow 1950 light red 2000 dark red .make sure to use places and loation from the map when analysing the sattelite imageries - if you have mostly one major same color on the imageries , try to spot one or more major differences of colors and their assiged value on one or more places emphasizing how different regions are affected based on the geographical data provided by the map borders if there is. finally Reporting on impact or relevance of observed changes on climate change and decision making according to that',
          CO: 'Use scientific language Compare all satellite imageries one by one when generating the comparison between images (multiple * images)for a represented coloring of Carbon Monoxide (CO) on a map by sattelite images carbone monoxide  co : Carbon Monoxide (CO) Carbon monoxide (CO) is an important atmospheric trace gas. In certain urban areas, it is a major atmospheric pollutant. Main sources of CO are combustion of fossil fuels, biomass burning, and atmospheric oxidation of methane and other hydrocarbons. The carbon monoxide total column is measured in mol per square meter (mol/ m^2).use the following values to represent colors dark blue is 0.0 and dark red is 0.1 mol/m^2 and the rest of color degrees in between.make sure to use places and loation from the map when analysing the sattelite imageries - if you have mostly one major same color on the imageries , try to spot one or more major differences of colors and their assiged value on one or more places emphasizing how different regions are affected based on the geographical data provided by the map borders if there is. finally Reporting on impact or relevance of observed changes on climate change and decision making according to that',
          cloud: 'Use scientific language Compare all satellite imageries one by one when generating the comparison between images (multiple * images)for a represented coloring of cloud base on a map by sattelite images  cloud base pressure measured at cloud base in pascal(Pa) use the following values to represent colors 110000 (PA) is dark red  97500 is light red 72500 is yellow and 47500 is light blue and 22500 is blue and 10000 is dark blue.make sure to use places and loation from the map when analysing the sattelite imageries - if you have mostly one major same color on the imageries , try to spot one or more major differences of colors and their assiged value on one or more places emphasizing how different regions are affected based on the geographical data provided by the map borders if there is. finally Reporting on impact or relevance of observed changes on climate change and decision making according to that',
          HCHO: 'Use scientific language Compare all satellite imageries one by one when generating the comparison between images (multiple * images)for a represented coloring of HCHO (Formaldehyde) on a map by sattelite images HCHO (Formaldehyde)Formaldehyde (HCHO)Long term satellite observations of tropospheric formaldehyde (HCHO) are essential to support air quality and chemistry-climate related studies from the regional to the global scale. The seasonal and inter-annual variations of the formaldehyde distribution are principally related to temperature changes and fire events, but also to changes in anthropogenic (human-made) activities. Its lifetime being of the order of a few hours, HCHO concentrations in the boundary layer can be directly related to the release of short-lived hydrocarbons, which mostly cannot be observed directly from space. Measurements are in mol per square meter (mol/ m^2). dark red 1E-3 red8.75E-4 yellow6.25E-4 turquoise 3.75E-4 blue 1.25E-4 dark blue 0.0.   .make sure to use places and loation from the map when analysing the sattelite imageries - if you have mostly one major same color on the imageries , try to spot one or more major differences of colors and their assiged value on one or more places emphasizing how different regions are affected based on the geographical data provided by the map borders if there is .finally Reporting on impact or relevance of observed changes on climate change and decision making according to that',
          NO2: 'Use scientific language Compare all satellite imageries one by one when generating the comparison between images (multiple * images)for a represented coloring of NO2 Nitrogen dioxide on a map by sattelite images NO2 Nitrogen dioxide : Nitrogen dioxide (NO2) and nitrogen oxide (NO) together are usually referred to as nitrogen oxides. They are important trace gases in the Earth’s atmosphere, present in both the troposphere and the stratosphere. They enter the atmosphere as a result of anthropogenic activities (particularly fossil fuel combustion and biomass burning) and natural processes (such as microbiological processes in soils, wildfires and lightning). Measurements are in mol per square meter (mol/ m^2)use the following values to represent colors 0.0 dark blue 1.25E-5 blue 3.75E-5 light blue 6.25E-5 yellow 8.75E-5 light red 1.0E-4 daek red [mol / m^2].make sure to use places and loation from the map when analysing the sattelite imageries - if you have mostly one major same color on the imageries , try to spot one or more major differences of colors and their assiged value on one or more places .finally Reporting on impact or relevance of observed changes on climate change and decision making according to that',
          O3: 'Use scientific language Compare all satellite imageries one by one when generating the comparison between images (multiple * images)for a represented coloring of O3 (Ozone) on a map by sattelite images O3 (Ozone)Ozone is of crucial importance for the equilibrium of the Earth atmosphere. In the stratosphere, the ozone layer shields the biosphere from dangerous solar ultraviolet radiation. In the troposphere, it acts as an efficient cleansing agent, but at high concentration it also becomes harmful to the health of humans, animals, and vegetation. Ozone is also an important greenhouse-gas contributor to ongoing climate change. Since the discovery of the Antarctic ozone hole in the 1980s and the subsequent Montreal Protocol regulating the production of chlorine-containing ozone-depleting substances, ozone has been routinely monitored from the ground and from space. Measurements are in mol per square meter (mol/ m^2)use the following values to represent colors 0.0 dark blue 0.045blue 0.135 turquoise green in betwen 0.225 yellow 0.315red 0.36 dark red.make sure to use places and loation from the map when analysing the sattelite imageries - if you have mostly one major same color on the imageries , try to spot one or more major differences of colors and their assiged value on one or more places emphasizing how different regions are affected based on the geographical data provided by the map borders if there is .finally Reporting on impact or relevance of observed changes on climate change and decision making according to that',
          SO2:'Use scientific language to analyze and compare all satellite imageries one by one when generating the comparison for a represented coloring of SO2 (Sulfur Dioxide) on a map. Focus on geographical boundaries and specific locations within the map borders. SO2 enters the Earths atmosphere through both natural and anthropogenic processes, impacting both local and global chemistry, with effects ranging from short-term pollution to climate change. Only about 30% of emitted SO2 comes from natural sources; the majority is anthropogenic. this the Earth s surface with  a revisit time of one day and a spatial resolution of 3.5 x 7 km, to analyze fine details, including smaller SO2 plumes. Measurements are in mol per square meter (mol/m^2). Represent colors as follows: 0.0: Dark blue 1.25E-3: Blue 3.75E-3: Turquoise green 6.25E-3: Yellow 8.75E-3: Red 1E-2: Dark red Make sure to incorporate specific places and locations from the map when analyzing the satellite images. If the images predominantly show one major color, identify and focus on any significant differences in color and their assigned values at specific locations. Finally, report on the impact or relevance of the observed changes on climate change and decision making according to that, emphasizing how different regions are affected based on the geographical data provided by the map borders if there is . '
        };

      // Set the prompt based on the selected analysis type or sub-prompt type
      //let prompt = prompts[analysisType] || prompts[subPromptType] || prompts.vegetation;
let prompt = prompts[analysisType] || prompts[subPromptType] ;

// If prompt is empty, respond with an error
if (!prompt) {
  res.status(400).json({ result: 'Invalid analysis or sub-prompt type.' });
  return;
}
    
      
    
      // Prepare the content for the API request
      const content = [
        ...uploadedFiles.map(file => ({
          fileData: {
            mimeType: file.mimeType,
            fileUri: file.uri,
          }
        })),
        { text: prompt }
      ];

      const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        generationConfig: { temperature: 1.0 },
        systemInstruction: "You are a satellite imagery expert specializing in comparing satellite images, analyzing changes, and detecting key features based on the provided prompts.",
      });

      const result = await model.generateContentStream(content);

      // Stream the response back to the client
      res.setHeader('Content-Type', 'text/plain');
      for await (const chunk of result.stream) {
        res.write(chunk.text());
      }
      res.end();

    } catch (error) {
      console.error('Error processing request:', error);
      res.status(500).json({ result: 'Internal Server Error' });
    } finally {
      if (uploadedFiles.length > 0) {
        await Promise.all(uploadedFiles.map(async (file) => {
          await fileManager.deleteFile(file.name);
          console.log(`Deleted ${file.displayName}`);
        }));
      }
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
