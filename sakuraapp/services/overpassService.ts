import { Location } from '../types';

// Overpass API endpoint
const OVERPASS_API_URL = 'https://overpass-api.de/api/interpreter';

/**
 * Fetches sakura (cherry blossom) locations within the given bounding box.
 * @param south Latitude south
 * @param west Longitude west
 * @param north Latitude north
 * @param east Longitude east
 */
export const fetchSakuraLocations = async (
  south: number,
  west: number,
  north: number,
  east: number
): Promise<Location[]> => {
  // Query to find nodes/ways/relations related to Sakura/Cherry Blossom
  // Broadened to include various tags and Japanese terms
  // Reduced timeout to 10s to fail faster and reduce server load
  const query = `
    [out:json][timeout:10];
    (
      // Specific species (Scientific names)
      node["species"~"Prunus serrulata|Cerasus",i](${south},${west},${north},${east});
      node["species:ja"~"サクラ|桜",i](${south},${west},${north},${east});
      
      // Name or description contains Sakura/Hanami
      node["name"~"桜|さくら|Sakura|花見",i](${south},${west},${north},${east});
      way["name"~"桜|さくら|Sakura|花見",i](${south},${west},${north},${east});
      relation["name"~"桜|さくら|Sakura|花見",i](${south},${west},${north},${east});

      // Description often contains info
      node["description"~"桜|さくら|Sakura",i](${south},${west},${north},${east});

      // Explicit cherry blossom tag
      node["natural"="tree"]["blossom"="cherry"](${south},${west},${north},${east});
      node["natural"="tree"]["flower:color"="pink"](${south},${west},${north},${east});
      
      // Parks named Sakura
      node["leisure"="park"]["name"~"桜|さくら",i](${south},${west},${north},${east});
      way["leisure"="park"]["name"~"桜|さくら",i](${south},${west},${north},${east});
    );
    out center 100;
  `; 

  try {
    const response = await fetch(OVERPASS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: `data=${encodeURIComponent(query)}`,
    });

    if (response.status === 429) {
        console.warn("Overpass API rate limit exceeded (429). Skipping update.");
        return [];
    }

    if (!response.ok) {
      throw new Error(`Overpass API Error: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.elements) return [];

    return data.elements.map((element: any) => {
      // Use center for ways/relations, or lat/lon for nodes
      const lat = element.lat || element.center?.lat;
      const lng = element.lon || element.center?.lon;
      
      if (!lat || !lng) return null;

      const nameTags = element.tags?.name || element.tags?.['name:ja'] || element.tags?.species || element.tags?.['species:ja'];
      const name = nameTags || "桜スポット";
      
      const description = element.tags?.description || 
                         (element.tags?.leisure === 'park' ? "桜のある公園です。" : "桜の木が見つかりました。");

      // Randomly assign a status for demo purposes since OSM doesn't have real-time bloom status
      const statuses = ['tsubomi', 'saki-hajime', 'mankai', 'chiri-hajime', 'hazakura'] as const;
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

      return {
        id: `${element.type}/${element.id}`,
        name: name,
        lat: lat,
        lng: lng,
        description: description,
        photos: [],
        currentStatus: randomStatus, 
      };
    }).filter((loc: Location | null): loc is Location => loc !== null);

  } catch (error) {
    console.error("Failed to fetch sakura locations:", error);
    return [];
  }
};