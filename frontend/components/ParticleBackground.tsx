"use client";

import { useCallback } from "react";
import Particles from "react-tsparticles";
import { loadSlim } from "tsparticles-slim";
import type { Container, Engine } from "tsparticles-engine";

export default function ParticleBackground() {
  const particlesInit = useCallback(async (engine: Engine) => {
    // load the slim version which contains the core features and shapes
    await loadSlim(engine);
  }, []);

  const particlesLoaded = useCallback(async (container: Container | undefined) => {
    console.log("Particles loaded", container);
  }, []);

  return (
    <Particles
      id="tsparticles"
      init={particlesInit}
      loaded={particlesLoaded}
      className="absolute inset-0 z-0 pointer-events-auto"
      options={{
        background: {
          color: {
            value: "transparent",
          },
        },
        fpsLimit: 120,
        interactivity: {
          events: {
            onClick: {
              enable: true,
              mode: "push",
            },
            onHover: {
              enable: true,
              mode: "grab", // Connects particles to the cursor
            },
            resize: true,
          },
          modes: {
            push: {
              quantity: 3,
            },
            grab: {
              distance: 150,
              links: {
                opacity: 0.8,
                color: "#059669"
              }
            },
            repulse: {
              distance: 200,
              duration: 0.4,
            },
          },
        },
        particles: {
          color: {
            value: ["#059669", "#D4AF37", "#12333D"], // Emerald, Gold, Dark Blue
          },
          links: {
            color: "#059669",
            distance: 150,
            enable: true,
            opacity: 0.4,
            width: 1,
          },
          move: {
            direction: "none",
            enable: true,
            outModes: {
              default: "bounce",
            },
            random: false,
            speed: 1.5,
            straight: false,
          },
          number: {
            density: {
              enable: true,
              area: 800,
            },
            value: 60,
          },
          opacity: {
            value: 0.6,
            animation: {
              enable: true,
              speed: 0.5,
              minimumValue: 0.3,
            }
          },
          shape: {
            type: "circle",
          },
          size: {
            value: { min: 3, max: 15 },
            animation: {
              enable: true,
              speed: 2,
              minimumValue: 3,
            }
          },
        },
        detectRetina: true,
      }}
    />
  );
}
