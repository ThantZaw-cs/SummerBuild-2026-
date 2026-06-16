import { NextResponse } from "next/server";

type OneMapSearchResult = {
  SEARCHVAL?: string;
  ADDRESS?: string;
  LATITUDE?: string;
  LONGITUDE?: string;
};

type OneMapSearchResponse = {
  results?: OneMapSearchResult[];
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query")?.trim();

  if (!query || query.length < 3) {
    return NextResponse.json({ result: null });
  }

  try {
    const endpoint = new URL("https://www.onemap.gov.sg/api/common/elastic/search");
    endpoint.searchParams.set("searchVal", query);
    endpoint.searchParams.set("returnGeom", "Y");
    endpoint.searchParams.set("getAddrDetails", "Y");
    endpoint.searchParams.set("pageNum", "1");

    const response = await fetch(endpoint, {
      headers: {
        accept: "application/json"
      },
      next: { revalidate: 60 * 60 * 24 }
    });

    if (!response.ok) {
      console.error("OneMap geocode failed", {
        endpoint: endpoint.toString(),
        status: response.status,
        body: await response.text()
      });

      return NextResponse.json({
        result: null,
        error: "Unable to search this location right now."
      });
    }

    const payload = (await response.json()) as OneMapSearchResponse;
    const match = payload.results?.find((result) =>
      isValidCoordinate(Number(result.LATITUDE), Number(result.LONGITUDE))
    );

    if (!match) {
      return NextResponse.json({ result: null });
    }

    return NextResponse.json({
      result: {
        lat: roundCoordinate(Number(match.LATITUDE)),
        lng: roundCoordinate(Number(match.LONGITUDE)),
        label: match.SEARCHVAL ?? match.ADDRESS ?? query,
        address: match.ADDRESS ?? null
      }
    });
  } catch (error) {
    console.error("OneMap geocode error", error);

    return NextResponse.json({
      result: null,
      error: "Unable to search this location right now."
    });
  }
}

function isValidCoordinate(lat: number, lng: number) {
  return (
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
}

function roundCoordinate(value: number) {
  return Math.round(value * 1000000) / 1000000;
}
