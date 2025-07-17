import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { motion } from "framer-motion"
import FeatureCard from "../FeatureCard/FeatureCard"
import {
  faComment,
  faSearch,
  faHexagonNodes,
  faScrewdriverWrench,
  faBook,
  faEye,
  faCirclePlay,
  faPlus,
} from "@fortawesome/free-solid-svg-icons"
import React, { useState } from "react"
import { useNavigate } from "@remix-run/react"
import { Feature } from "../types"
import { useTheme } from "@/utils/darkTheme/theme-provider"
import Modal from "@/components/Shared/Modal/Modal"
import { useCloseSidebar } from "@/store/layout"
import OpenningTitle from "@/components/Shared/OpenningTitle/OpenningTitle"
import BackButton from "@/components/ui/BackButton/BackButton"
import { FeatureCardGridProps } from "@/components/Homepage/FeatureCardsGrid/types"

const FeatureCardsGrid: React.FC<FeatureCardGridProps> = ({ disabledVars }) => {
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null)
  const navigate = useNavigate()
  const [theme] = useTheme()
  const [showVideoModal, setShowVideoModal] = useState<boolean>(false)
  const close = useCloseSidebar((state) => state.close)

  const features: Feature[] = [
    {
      icon: <FontAwesomeIcon icon={faComment} />,
      title: "Chat",
      description: "Ask questions across our documents, data and APIs",
      hideOnMobile: false,
      hoverText: "Chat SI",
      link: "/chatSi",
      actionIcon: (
        <FontAwesomeIcon
          icon={faCirclePlay}
          //onClick={() => setShowVideoModal(true)}
        />
      ),
      bgImg:
        theme === "light"
          ? "url('/img/homepage/home_chatsi_light.png')"
          : "url('/img/homepage/home_chatsi_dark.png')",
    },
    {
      icon: <FontAwesomeIcon icon={faSearch} />,
      title: "Search",
      description: "Search for documents and save them in a project space",
      hideOnMobile: false,
      hoverText: "Search SI, OpenDash",
      actionIcon: <FontAwesomeIcon icon={faPlus} />,
      bgImg:
        theme === "light"
          ? "url('/img/homepage/home_search_light.png')"
          : "url('/img/homepage/home_search_dark.png')",
      subfeatures: [
        {
          title: "Search SI",
          description: "Search Open SI's internal knowledge base",
          actionIcon: <FontAwesomeIcon icon={faCirclePlay} />,
          link: "/searchSi/semanticSearch",
          bgImg:
            theme === "light"
              ? "url('/img/homepage/home_transfor_light.png')"
              : "url('/img/homepage/home_transfor_dark.png')",
        },
        {
          title: "Search Spaces",
          description: "Private space to store documents for your projects",
          actionIcon: <FontAwesomeIcon icon={faCirclePlay} />,
          link: "/searchSpaces",
          bgImg:
            theme === "light"
              ? "url('/img/homepage/home_discover_light.png')"
              : "url('/img/homepage/home_discover_dark.png')",
        },
        {
          title: "OpenDash",
          description: "Use AI to find your favorite dashboards",
          actionIcon: <FontAwesomeIcon icon={faCirclePlay} />,
          bgImg:
            theme === "light"
              ? "url('/img/homepage/home_chatsi_light.png')"
              : "url('/img/homepage/home_chatsi_dark.png')",
        },
      ],
    },
    {
      icon: <FontAwesomeIcon icon={faScrewdriverWrench} />,
      title: "Transform",
      description: "Tools to leverage your private documents",
      hideOnMobile: true,
      hoverText: "DocTools",
      bgImg:
        theme === "light"
          ? "url('/img/homepage/home_transfor_light.png')"
          : "url('/img/homepage/home_transfor_dark.png')",
      actionIcon: <FontAwesomeIcon icon={faPlus} />,
      disabled: disabledVars["SHOW_DOCUMENT_TOOLS"] === false,
      subfeatures: [
        {
          title: "Q&A",
          description: "Use the Chat SI engine for you private documents",
          actionIcon: <FontAwesomeIcon icon={faCirclePlay} />,
          bgImg:
            theme === "light"
              ? "url('/img/homepage/home_research_light.png')"
              : "url('/img/homepage/home_research_dark.png')",
          link: "/documentTools/QA",
        },
        {
          title: "Summarization",
          description: "Create custom summaries for you private documents",
          actionIcon: <FontAwesomeIcon icon={faCirclePlay} />,
          bgImg:
            theme === "light"
              ? "url('/img/homepage/home_transfor_light.png')"
              : "url('/img/homepage/home_transfor_dark.png')",
          link: "/documentTools/summarization",
        },
        {
          title: "Output Parsers",
          description: "Extract custom tables from document contents",
          actionIcon: <FontAwesomeIcon icon={faCirclePlay} />,
          bgImg:
            theme === "light"
              ? "url('/img/homepage/home_chatsi_light.png')"
              : "url('/img/homepage/home_chatsi_dark.png')",
          link: "/documentTools/outputParsers",
        },
        {
          title: "Aggregator",
          description: "Cross-document synthesis in a flash",
          actionIcon: <FontAwesomeIcon icon={faCirclePlay} />,
          link: "/documentTools/aggService",
          bgImg:
            theme === "light"
              ? "url('/img/homepage/home_discover_light.png')"
              : "url('/img/homepage/home_discover_dark.png')",
        },
      ],
    },
    {
      icon: <FontAwesomeIcon icon={faBook} />,
      title: "Research",
      description: "Use GenAI to support your desk research",
      hideOnMobile: true,
      hoverText: "LitePaper, Agentcy",
      bgImg:
        theme === "light"
          ? "url('/img/homepage/home_research_light.png')"
          : "url('/img/homepage/home_research_dark.png')",
      actionIcon: <FontAwesomeIcon icon={faPlus} />,
      disabled: disabledVars["SHOW_OPEN_STORY"] === false,
      subfeatures: [
        {
          title: "LitePaper",
          description: "Build comprehensive analysis in minutes",
          actionIcon: <FontAwesomeIcon icon={faCirclePlay} />,
          bgImg:
            theme === "light"
              ? "url('/img/homepage/home_transfor_light.png')"
              : "url('/img/homepage/home_transfor_dark.png')",
          link: "/litePaper",
        },
        {
          title: "Agentcy",
          description: "Hire agents to help you with your analysis",
          actionIcon: <FontAwesomeIcon icon={faCirclePlay} />,
          bgImg:
            theme === "light"
              ? "url('/img/homepage/home_chatsi_light.png')"
              : "url('/img/homepage/home_chatsi_dark.png')",
        },
      ],
    },
    {
      icon: <FontAwesomeIcon icon={faEye} />,
      title: "Discover",
      description: "AI generated articles and podcasts for research",
      hideOnMobile: false,
      disabled: disabledVars["SHOW_DISCOVERY"] === false,
      hoverText: "Discovery",
      actionIcon: (
        <FontAwesomeIcon
          icon={faCirclePlay}
          //onClick={() => setShowVideoModal(true)}
        />
      ),
      bgImg:
        theme === "light"
          ? "url('/img/homepage/home_discover_light.png')"
          : "url('/img/homepage/home_discover_dark.png')",
      link: "/discovery",
    },
    {
      icon: <FontAwesomeIcon icon={faHexagonNodes} />,
      title: "Simulate",
      description: "Plan and generate long-range forecast scenarios",
      disabled: disabledVars["SHOW_FORECAST"] === false,
      actionIcon: (
        <FontAwesomeIcon
          icon={faCirclePlay}
          //onClick={() => setShowVideoModal(true)}
        />
      ),
      bgImg:
        theme === "light"
          ? "url('/img/homepage/home_forecast_light.png')"
          : "url('/img/homepage/home_forecast_dark.png')",
      hideOnMobile: true,
      hoverText: "OMM",
      link: "/omm/scenarios",
    },
  ]

  const handleFeatureClick = (feature: Feature): void => {
    if (feature.subfeatures) {
      setSelectedFeature(feature)
    } else if (feature.link) {
      navigate(feature.link)
    }
  }

  return (
    <>
      {selectedFeature ? (
        <motion.div
          className={`w-full flex flex-col items-center`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <OpenningTitle primaryText={selectedFeature.title} />
          <h2 className="text-3xl text-center">
            {selectedFeature.description}
          </h2>
          <div
            className={`mt-[50px] grid grid-cols-1 items-center gap-5 lg:gap-[30px] w-full mx-auto ${
              close
                ? "sm:w-fit sm:grid-cols-2 xl:grid-cols-3"
                : "sm:grid-cols-1 lg:w-fit lg:grid-cols-2 2xl:grid-cols-3"
            }`}
          >
            {selectedFeature.subfeatures?.map((feature, index) => (
              <FeatureCard
                key={index}
                title={feature.title}
                description={feature.description}
                actionIcon={feature.actionIcon}
                bgImg={feature.bgImg}
                onclick={() => {
                  if (feature.link) {
                    navigate(feature.link)
                  }
                }}
              />
            ))}
          </div>

          <BackButton customClick={() => setSelectedFeature(null)} />
        </motion.div>
      ) : (
        <div className={`w-full flex flex-col items-center mt-14 mb-14`}>
          <OpenningTitle
            primaryText="Open"
            secondaryText="Strategic Insights"
            version="Beta"
          />
          <div
            className={`grid grid-cols-1 items-center gap-5 lg:gap-[30px] w-full mx-auto mt-[50px] ${
              close
                ? "sm:w-fit sm:grid-cols-2 xl:grid-cols-3"
                : "sm:grid-cols-1 lg:w-fit lg:grid-cols-2 2xl:grid-cols-3"
            }`}
          >
            {features.map((feature, index) => (
              <FeatureCard
                disabled={feature.disabled}
                key={index}
                icon={feature.icon}
                title={feature.title}
                bgImg={feature.bgImg}
                description={feature.description}
                hoverText={feature.hoverText}
                actionIcon={feature.actionIcon}
                onclick={() => handleFeatureClick(feature)}
                hideOnMobile={feature.hideOnMobile}
              />
            ))}
          </div>
        </div>
      )}
      {showVideoModal && (
        <Modal
          title={selectedFeature?.title as string}
          handleClose={() => setShowVideoModal(false)}
          size="big"
        >
          <div className="h-[600px]">
            <iframe
              src="https://www.youtube.com/embed/mxQOOMX4NQM"
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
            ></iframe>
          </div>
        </Modal>
      )}
    </>
  )
}

export default FeatureCardsGrid
