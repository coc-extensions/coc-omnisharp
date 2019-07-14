/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/

import { workspace } from 'coc.nvim'
import {sleep} from "./utils"
import fs = require("fs");
import path = require("path");
import process = require("process");
import { IncomingMessage, RequestOptions, Agent } from 'http'
import { parse } from 'url'
const tunnel = require('tunnel')
const followRedirects = require("follow-redirects")
const unzip = require("extract-zip");
const rimraf = require("rimraf")

export enum OperatingSystem {
    Unknown,
    Windows,
    MacOS,
    Linux,
}

export interface IPlatformDetails {
    operatingSystem: OperatingSystem;
    isOS64Bit: boolean;
    isProcess64Bit: boolean;
}

export function getPlatformDetails(): IPlatformDetails {
    let operatingSystem = OperatingSystem.Unknown;

    if (process.platform === "win32") {
        operatingSystem = OperatingSystem.Windows;
    } else if (process.platform === "darwin") {
        operatingSystem = OperatingSystem.MacOS;
    } else if (process.platform === "linux") {
        operatingSystem = OperatingSystem.Linux;
    }

    const isProcess64Bit = process.arch === "x64";

    return {
        operatingSystem,
        isOS64Bit: isProcess64Bit || process.env.hasOwnProperty("PROCESSOR_ARCHITEW6432"),
        isProcess64Bit,
    };
}


function getAgent(protocol: string): Agent {
  let proxy = workspace.getConfiguration('http').get<string>('proxy', '')
  let key = protocol.startsWith('https') ? 'HTTPS_PROXY' : 'HTTP_PROXY'
  if (!proxy && process.env[key]) {
    proxy = process.env[key].replace(/^https?:\/\//, '').replace(/\/$/, '')
  }
  if (proxy) {
    let auth = proxy.includes('@') ? proxy.split('@', 2)[0] : ''
    let parts = auth.length ? proxy.slice(auth.length + 1).split(':') : proxy.split(':')
    if (parts.length > 1) {
      let agent = tunnel.httpsOverHttp({
        proxy: {
          headers: {},
          host: parts[0],
          port: parseInt(parts[1], 10),
          proxyAuth: auth
        }
      })
      return agent
    }
  }

  return undefined
}

export const omnisharpDirectory = path.join(__dirname, "..", "..", "omnisharp")
const omnisharpZip       = omnisharpDirectory + ".zip"
const URL_Windows        = "https://github.com/OmniSharp/omnisharp-roslyn/releases/download/RELEASE/omnisharp-win-x64.zip"
const URL_Osx            = "https://github.com/OmniSharp/omnisharp-roslyn/releases/download/RELEASE/omnisharp-osx.zip"
const URL_Linux          = "https://github.com/OmniSharp/omnisharp-roslyn/releases/download/RELEASE/omnisharp-linux-x64.zip"

export const omnisharpExe = path.join(omnisharpDirectory, "omnisharp", "OmniSharp.exe")

export async function downloadOmnisharp() {

    if(fs.existsSync(omnisharpDirectory)){
        rimraf.sync(omnisharpDirectory)
    }

    let platform = getPlatformDetails()
    let url = (()=>{
        switch(platform.operatingSystem) {
            case OperatingSystem.Windows: return URL_Windows
            case OperatingSystem.Linux: return URL_Linux
            case OperatingSystem.MacOS: return URL_Osx
            default: throw "Unsupported operating system"
        }
    })().replace("RELEASE", "v1.33.0")

    fs.mkdirSync(omnisharpDirectory)

    let endpoint = parse(url)
    let agent = getAgent(endpoint.protocol)

    let opts: RequestOptions = {
        method: 'GET',
        hostname: endpoint.hostname,
        port: endpoint.port ? parseInt(endpoint.port, 10) : (endpoint.protocol === 'https:' ? 443 : 80),
        path: endpoint.path,
        protocol: url.startsWith('https') ? 'https:' : 'http:',
        agent,
        headers: {
            'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64)'
        }
    }

    await new Promise<void>((resolve, reject) => {
        const req = followRedirects.https.request(url, (res: IncomingMessage) => {
          if (res.statusCode != 200) {
            reject(new Error(`Invalid response from ${url}: ${res.statusCode}`))
            return
          }
          let file = fs.createWriteStream(omnisharpZip)
          let stream = res.pipe(file)
          stream.on('finish', resolve)
        })
        req.on('error', reject)
        req.end()
    })

    await new Promise<void>((resolve, reject) => {
        unzip(omnisharpZip, {dir: omnisharpDirectory}, (err: any) => {
            if(err) reject(err)
            else resolve()
        })
    })

    fs.unlinkSync(omnisharpZip)
}
