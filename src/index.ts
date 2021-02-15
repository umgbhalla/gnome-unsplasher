import { height, width } from "screenz";
import fetch from "node-fetch";
import dotenv from "dotenv";
import { Metadata, Options } from "../types/interfaces";
import fs from "fs";
import path from "path";
import { spawn } from "child_process";

dotenv.config();

const SAVE_FILES_PATH = process.env.SAVE_FILES_PATH || process.env.HOME || "~";
const QUERY = process.env.QUERY || "";

const apiKeys = [
  "KU76e-L5LwjeOxB98AWi_NJ1BfnSe1bFQ1A7Aul9foA",
  "ttUqGcFjnw_kag6oa9X-oM_9H5BSHFG32rFa9sIbwKs",
  "HQtqmJS7bjUyzlWJd8D1EKSmugm6CNTlYul58-DVN3Q",
  "fymYR5htky3PF1O4-P8YN4FqcpVim6lHd2S5bv79F5M",
];
const apiKey = apiKeys[Math.floor(Math.random() * apiKeys.length)];

function buildUrl({
  featured,
  orientation,
  search,
  width,
  height,
  random,
}: Options): string {
  const orientation_ = orientation ? `&orientation=${orientation}` : "";
  const featured_ = featured ? "&featured" : "";
  const width_ = width ? `&w=${width}` : "";
  const height_ = height ? `&h=${height}` : "";
  const search_ = search && random ? `&query=${search}` : "";
  return (
    `https://api.unsplash.com/photos/random?client_id=${apiKey}` +
    orientation_ +
    featured_ +
    width_ +
    height_ +
    width_ +
    search_
  );
}

async function downloadNewWallPaperMetadata(
  options: Options
): Promise<Metadata> {
  const url = buildUrl(options);
  console.log(`Downloading ${url}`);
  const response = await fetch(url);
  return response.json();
}

async function downloadNewWallpaper(url: string): Promise<Buffer> {
  console.log(`Downloading image from: ${url}`);
  return (await fetch(url)).buffer();
}

function saveFile(where: string, data: Buffer) {
  fs.writeFileSync(where, data);
  console.log(`Saved pic at: ${SAVE_FILES_PATH} as ${where}`);
}

function setNewWallpaper(fileUri: string) {
  spawn("gsettings", [
    "set",
    "org.gnome.desktop.background",
    "picture-uri",
    `file://${fileUri}`,
  ]);
}

async function exec() {
  const metadata: Metadata = await downloadNewWallPaperMetadata({
    width,
    height,
    orientation: "landscape",
    search: QUERY,
  });

  console.log(`Downloaded metadata: ${metadata.alt_description}`);
  if (!metadata) {
    return;
  }

  const image: Buffer = await downloadNewWallpaper(metadata.urls.custom);
  const fileUri = path.join(
    SAVE_FILES_PATH,
    `${metadata.alt_description.replace(/ /g, "_")}.jpg`
  );
  saveFile(fileUri, image);
  setNewWallpaper(fileUri);
}

exec();