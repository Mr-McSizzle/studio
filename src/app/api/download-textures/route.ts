import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { promises as fsPromises } from 'fs';

// Function to download a file from a URL and save it to the specified path
async function downloadFile(url: string, outputPath: string): Promise<void> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to download file: ${response.statusText}`);
    }
    
    const buffer = await response.arrayBuffer();
    const outputDir = path.dirname(outputPath);
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
      await fsPromises.mkdir(outputDir, { recursive: true });
    }
    
    await fsPromises.writeFile(outputPath, Buffer.from(buffer));
    console.log(`Downloaded ${url} to ${outputPath}`);
  } catch (error) {
    console.error(`Error downloading ${url}:`, error);
    throw error;
  }
}

export async function GET() {
  try {
    const textures = [
      {
        url: 'https://raw.githubusercontent.com/turban/webgl-earth/master/images/2_no_clouds_4k.jpg',
        filename: 'earth_nightmap.jpg'
      },
      {
        url: 'https://raw.githubusercontent.com/turban/webgl-earth/master/images/elev_bump_4k.jpg',
        filename: 'earth_bumpmap.jpg'
      },
      {
        url: 'https://raw.githubusercontent.com/turban/webgl-earth/master/images/water_4k.png',
        filename: 'earth_specular.jpg'
      },
      {
        url: 'https://raw.githubusercontent.com/turban/webgl-earth/master/images/fair_clouds_4k.png',
        filename: 'earth_clouds.png'
      }
    ];

    const publicDir = path.join(process.cwd(), 'public');
    const texturesDir = path.join(publicDir, 'textures');

    // Create textures directory if it doesn't exist
    if (!fs.existsSync(texturesDir)) {
      await fsPromises.mkdir(texturesDir, { recursive: true });
    }

    // Download all textures
    const downloadPromises = textures.map(texture => 
      downloadFile(texture.url, path.join(texturesDir, texture.filename))
    );

    await Promise.all(downloadPromises);

    return NextResponse.json({ 
      success: true, 
      message: 'All textures downloaded successfully',
      textures: textures.map(t => `/textures/${t.filename}`)
    });
  } catch (error) {
    console.error('Error downloading textures:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to download textures' },
      { status: 500 }
    );
  }
}