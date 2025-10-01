import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ITINERARY = `
Here's a sample 5-night Dubai itinerary (from Bangalore) you can tweak. Use it as a template to discuss or refine with the candidate.

—

Basic Info: Visa, Insurance, Transfers

Item	Notes / Tips
Visa for Indians visiting UAE	Indian passport holders require a tourist / visit visa before travel (unless eligible for visa on arrival).  ￼  Usually 3–5 working days processing via online or via airline/visa agent.  ￼  Documents required: valid passport (≥6 months validity), passport-size photo, flight tickets, hotel bookings.  ￼
Travel insurance	Must cover health, emergency evacuation, trip cancellation.  Get insurance covering UAE hospitalization, luggage loss, flight delays.  Buy as soon as flights are booked so you cover from departure.
Airport Transfers	Use pre-booked private transfer (hotel shuttle or car) or reliable ride-sharing / airport taxi.  At arrival (DXB) → hotel, at departure hotel → DXB.  Factor travel time (30–60 min depending on hotel) + buffer.
Local transport	Use Dubai Metro, local buses, taxis, ride-hailing (Careem, Uber).  Use a Nol card (for metro/bus) or app-based top-up.
Time zone & currency	Dubai is UTC+4, Bangalore is UTC+5:30.  Currency: UAE Dirham (AED).

—

Flights & Hotel (sample)
	•	Departure (BLR → DXB)
	•	Date: 20 November
	•	Airline: e.g. Emirates / IndiGo / Air India (pick a convenient timing)
	•	Approx flight time: ~4–5 hours
	•	Return (DXB → BLR)
	•	Date: 25 November (5 nights)
	•	Choose an evening/midday flight allowing sufficient time to reach airport.
	•	Hotel suggestions (mid to upscale)
	•	Night 1–2: stay in Downtown / Dubai Mall / Burj Khalifa area (good for central sightseeing)
	•	Night 3–4: move to Jumeirah / Marina / Palm to enjoy beach, seaside views
	•	Night 5: closer to airport or in same area as departure airport (for convenience)

Pick hotels with good reviews, breakfast included, and metro / tram access.

—

Day-by-Day Itinerary (5 Nights / 6 Days baseline)

Day 0 → 20 Nov
	•	Depart Bangalore in afternoon / evening
	•	Arrive Dubai (night)
	•	Transfer to hotel, rest

Day 1 (21 Nov): Dubai City + Burj Khalifa + Dubai Mall
	•	Breakfast at hotel
	•	Visit Dubai Mall, see the Dubai Aquarium, shopping
	•	Go up to Burj Khalifa "At The Top" (book your timings in advance)
	•	Lunch in the Mall or Downtown
	•	Afternoon: Old Dubai & Al Fahidi Historic District, ride Abra across Dubai Creek, visit Gold Souk / Spice Souk
	•	Evening: Fountain show & dinner nearby

Day 2 (22 Nov): Palm Jumeirah, Atlantis & Marina
	•	Breakfast
	•	Visit Palm Jumeirah, Atlantis Aquaventure / Lost Chambers (if interested)
	•	Lunch in Atlantis area or The Pointe
	•	Later: Dubai Marina stroll, Sunset Cruise or dinner cruise in Marina
	•	Explore The Walk, JBR in evening

Day 3 (23 Nov): Desert Safari + Evening entertainment
	•	Morning: free / relax / optional beach time
	•	Afternoon (~3 pm): depart for Desert Safari (dune bashing, camel ride, sandboarding, BBQ dinner, cultural show)
	•	Return to hotel late evening

Day 4 (24 Nov): Abu Dhabi day-trip or Theme Park / Museum day
	•	Option A: Day trip to Abu Dhabi: Sheikh Zayed Grand Mosque, Louvre Abu Dhabi, Corniche, Qasr Al Watan
	•	Option B: In Dubai: visit Dubai Frame, Museum of the Future, IMG Worlds or Global Village (seasonal)
	•	Evening: relax, final shopping, explore local markets

Day 5 (25 Nov): Beach / Leisure + Departure
	•	Morning: leisure at hotel beach or pool
	•	Lunch locally
	•	Check-out (depending on flight timing), transfer to airport
	•	Depart Dubai → Bangalore

—

Sample Itinerary Table (with times)

Day	Morning	Midday / Afternoon	Evening / Night
Day 1	Dubai Mall + Aquarium	Burj Khalifa + Lunch	Old Dubai souks, fountain show, dinner
Day 2	Palm Jumeirah / Atlantis	Lunch & Marine stroll	Marina cruise, JBR walk
Day 3	Relax / optional	Desert Safari (depart ~3 pm)	BBQ, show, return late
Day 4	Abu Dhabi or Dubai attractions	Lunch in destination	Return / museum / shopping
Day 5	Beach / pool	Lunch & pack	Transfer, flight back

—

Tips & optional add-ons
	•	Book tickets in advance: Burj Khalifa, Atlantis, desert safari, Louvre Abu Dhabi etc to avoid queues.
	•	Clothing: modest wear in public/shopping; swimwear at beaches/pools.
	•	Sun protection: hats, sunscreen, water bottle.
	•	Power/adaptors: UAE uses type G (3-pin) sockets.
	•	Food: ample halal / Indian food is available.
	•	Festival / events: check if there's a festival during your travel, might have special events.
	•	Stay flexible: include buffer, don't over-pack every hour
`;

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { question } = await req.json();
    
    if (!question) {
      return new Response(
        JSON.stringify({ error: "Question is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Processing question:", question);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY not found");
      return new Response(
        JSON.stringify({ error: "API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const systemPrompt = `You are a travel chatbot that answers questions ONLY from the following Dubai itinerary:

${ITINERARY}

RULES:
1. Use only the provided itinerary text when answering
2. Always reply in one short, concise, natural sentence
3. If the user asks something not covered in the itinerary, reply exactly: "Not provided"
4. Do not copy large blocks of text. Summarize into a direct human-like answer
5. Do not invent, guess, or add information beyond the itinerary
6. No greetings, no explanations, no filler—only the answer

Examples:
Q: "When is the return flight?"
A: "25 November."

Q: "What is planned on Day 3?"
A: "Desert safari with dune bashing, camel ride, BBQ dinner, and cultural show."

Q: "Which hotel do we stay at?"
A: "Not provided"

Q: "What's the currency in Dubai?"
A: "UAE Dirham (AED)."`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: question },
        ],
        temperature: 0.3,
        max_tokens: 100,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI API error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limits exceeded, please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required, please add funds to your workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: "AI service error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const answer = data.choices?.[0]?.message?.content || "Sorry, I couldn't process that question.";

    console.log("Generated answer:", answer);

    return new Response(
      JSON.stringify({ answer }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Function error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
