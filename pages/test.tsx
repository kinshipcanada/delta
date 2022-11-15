import * as React from "react";
import Head from "next/head";
import { useRouter } from "next/router";


let Globe = () => null;
if (typeof window !== "undefined") Globe = require("react-globe.gl").default;

import { createClient } from "@supabase/supabase-js";
import toast, { Toaster } from "react-hot-toast";

const makeid = (length) => {
  var result = [];
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result.push(
      characters.charAt(Math.floor(Math.random() * charactersLength))
    );
  }
  return result.join("");
};

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const Home = () => {
  const [imageUrl, setImageUrl] = React.useState("/images/texture.png");
  const globeRef: any = React.useRef(null);
  const arcsData = [1, 2, 3, 4, 5, 6].map(() => ({
    startLat: (Math.random() - 0.5) * 180,
    startLng: (Math.random() - 0.5) * 360,
    endLat: (Math.random() - 0.5) * 180,
    endLng: (Math.random() - 0.5) * 360,
    color: [["#000000"][0], ["#000000"][0]],
  }));

  return (
    <div className="">


      <main>
            <Globe
                //@ts-ignore
                ref={globeRef}
                width={480}
                height={480}
                backgroundColor={"rgba(0,0,0,0)"}
                globeImageUrl={imageUrl}
                arcColor={"color"}
                arcsData={arcsData}
                arcDashGap={0.6}
                arcDashLength={0.3}
                arcDashAnimateTime={4000 + 500}
                rendererConfig={{ preserveDrawingBuffer: true }}
            />
      </main>

    </div>
  );
};

export default Home;