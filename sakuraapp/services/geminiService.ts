// import { GoogleGenAI } from "@google/genai";

// const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// export interface SakuraAnalysisResult {
//   isSakura: boolean;
//   description: string;
//   haiku: string;
// }

// /**
//  * Analyzes an uploaded image to check if it contains cherry blossoms
//  * and generates a poetic description.
//  */
// export const analyzeSakuraPhoto = async (base64Image: string): Promise<SakuraAnalysisResult> => {
//   try {
//     // Extract base64 data if it includes the prefix
//     const base64Data = base64Image.split(',')[1] || base64Image;

//     const response = await ai.models.generateContent({
//       model: 'gemini-2.5-flash-image',
//       contents: {
//         parts: [
//           {
//             inlineData: {
//               mimeType: 'image/jpeg', // Assuming jpeg for simplicity from canvas/input
//               data: base64Data,
//             },
//           },
//           {
//             text: `
//               この画像を分析してください。
//               これは「桜（さくら）」の写真ですか？
//               桜の花、桜の木、お花見の風景などが主要な被写体である場合のみ true を返してください。
//               人物、動物、食事、他の種類の花などがメインで、桜が映っていない場合は厳密に false を返してください。
              
//               以下のフォーマットのJSONのみを返してください。マークダウンのコードブロックは不要です。
              
//               {
//                 "isSakura": boolean,
//                 "description": "画像の状況を短く説明（日本語）。桜でない場合はその旨を説明。",
//                 "haiku": "この画像を見て一句詠んでください（日本語）"
//               }
//             `,
//           },
//         ],
//       },
//       config: {
//         temperature: 0.4,
//       }
//     });

//     const text = response.text || "{}";
//     // Clean up potential markdown formatting if model ignores instructions
//     const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
//     try {
//       const result = JSON.parse(jsonStr) as SakuraAnalysisResult;
//       return result;
//     } catch (e) {
//       console.error("Failed to parse Gemini response", e);
//       return {
//         isSakura: true, // Fallback, but in production might want to be safer
//         description: "美しい桜の写真です。",
//         haiku: "春風に 舞う花びらの 美しさ"
//       };
//     }

//   } catch (error) {
//     console.error("Gemini API Error:", error);
//     // Fallback in case of API error
//     return {
//       isSakura: true,
//       description: "桜の写真をアップロードしました。",
//       haiku: "花見かな 心も晴れる 春の日よ"
//     };
//   }
// };