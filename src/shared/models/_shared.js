import { version } from './_validators'

export const definitionsRelease = {
  type: 'object',
  properties: {
    download_url: {
      type: 'string',
    },
    file_name: {
      type: 'string',
    },
    info_json: {
      factorio_version: {
        type: 'string',
        pattern: version,
      },
    },
    released_at: {
      type: 'string',
    },
    version: {
      type: 'string',
    },
    sha1: {
      type: 'string',
    },
  },
}

export const definitionsInstalledMod = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
    },
    title: {
      type: 'string',
    },
    author: {
      type: 'string',
    },
    version: {
      type: 'string',
      pattern: version,
    },
    contact: {
      type: 'string',
    },
    homepage: {
      type: 'string',
    },
    factorio_version: {
      type: 'string',
    },
    description: {
      type: 'string',
    },
    dependencies: {
      type: 'array',
      items: {
        type: 'string',
      },
    },
    dependenciesParsed: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          installed: {
            type: 'boolean',
          },
          name: {
            type: 'string',
          },
          operator: {
            type: 'string',
            enum: ['<=', '>=', '=', '<', '>', ''],
          },
          version: {
            type: 'string',
            pattern: version + '|^$',
          },
          type: {
            type: 'string',
          },
        },
        required: ['name', 'type'],
      },
    },
    hasMissingRequiredDependencies: {
      type: 'boolean',
    },
  },
  required: ['name', 'version'],
}

export const definitionsOnlineMod = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
    },
    title: {
      type: 'string',
    },
    owner: {
      type: 'string',
    },
    summary: {
      type: 'string',
    },
    downloads_count: {
      type: 'number',
    },
    category: {
      type: 'string',
      // enum: tags,
    },
    score: {
      type: 'number',
    },
    latest_release: {
      ...definitionsRelease,
    },
    thumbnail: {
      type: 'string',
    },
    created_at: {
      type: 'string',
      format: 'date-time',
    },
    // Available once full details have been requested for the online mod
    updated_at: {
      type: 'string',
      format: 'date-time',
    },
    description: {
      type: 'string',
    },
    tag: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          // enum: tags,
        },
      },
    },
    faq: {
      type: 'string',
    },
    github_path: {
      type: 'string',
    },
    license: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
        },
        url: {
          type: 'string',
        },
      },
    },
    releases: {
      type: 'array',
      items: Object.assign({}, definitionsRelease, {
        version: {
          type: 'string',
          pattern: version,
        },
        info_json: {
          dependencies: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
        },
      }),
    },
  },
}
