export const defaultSections = [
  {
    title: "Introduction: The Rise of Nicotine Pouches in Sweden",
    type: "Subsections",
    subtype: null,
    subsection: [
      {
        layout_metadata: {
          displayMode: "Single block",
        },
        title: "Introduction",
        prompt: "The Rise of Nicotine Pouches in Sweden",
        type: "APIs",
        subtype: "ChatGPT",
      },
      {
        layout_metadata: {
          displayMode: "Single block",
        },
        title: "Oral nicotine culture",
        prompt:
          "Why is there such a culture around oral nicotine products such as snus and nicotine pouches in Sweden?",
        type: "APIs",
        subtype: "ChatGPT",
      },
      {
        layout_metadata: {
          displayMode: "Single block",
        },
        title: "Market Size and Share",
        prompt:
          "What is the overall market volume for nicotine pouches from 2020-2024 and how does it compare with other subcategories?",
        type: "Data",
        subtype: "OMM",
      },
    ],
  },
  {
    title: "Regulatory Environment",
    type: "Subsections",
    subtype: null,
    subsection: [
      {
        layout_metadata: {
          displayMode: "Single block",
        },
        title: "Swedish regulations",
        prompt:
          "What are the Swedish regulations on nicotine pouches specifically?",
        type: "APIs",
        subtype: "Web Search",
      },
      {
        layout_metadata: {
          displayMode: "Single block",
        },
        title: "How Does the EU Regulate Nicotine Pouches?",
        prompt:
          "What are the European Union regulations on nicotine pouches specifically?",
        type: "APIs",
        subtype: "Web Search",
      },
      {
        layout_metadata: {
          displayMode: "Single block",
        },
        title: "Nicotine Pouch Bans Around the World",
        prompt: "What countries are nicotine pouches prohibited/banned",
        type: "APIs",
        subtype: "Web Search",
      },
    ],
  },
  {
    title: "Power Players: Brands Leading the Charge",
    type: "Subsections",
    subtype: null,
    subsection: [
      {
        layout_metadata: {
          displayMode: "Single block",
        },
        title: "Desk Research",
        prompt:
          "Give me a detailed summary of the key nicotine pouch brands, focusing on Sweden",
        type: "Documents",
        is_opensi_selected: true,
        subtype: "Chat SI",
      },
      {
        layout_metadata: {
          displayMode: "Single block",
        },
        title: "Top Brands Retail Audit",
        prompt:
          "What are the top brands by total volume in Sweden for nicotine pouches. Create a pie chart to show the volume splits. ",
        type: "Data",
        subtype: "RADRS",
      },
    ],
  },
  {
    type: "Subsections",
    subtype: null,
    title: "Changing Consumer Behaviors",
    subsection: [
      {
        layout_metadata: {
          displayMode: "Single block",
        },
        title: "Incidence Evolution",
        prompt: "Show me the nicotine pouch incidence rate in Sweden by year",
        type: "Data",
        subtype: "Incidence",
      },
      {
        layout_metadata: {
          displayMode: "Single block",
        },
        title: "Incidence rates in other markets",
        prompt: "Show me the nicotine pouch incidence rate in each market",
        type: "Data",
        subtype: "Incidence",
      },
      {
        layout_metadata: {
          displayMode: "Single block",
        },
        title: "Consumer Profile",
        prompt: "What is the profile of a nicotine pouch consumer?",
        type: "Data",
        subtype: "Incidence",
      },
    ],
  },
] as const
