module ColorPalette where

import Http
import Json.Decode as Json exposing ((:=))
import Task exposing (..)

import Html exposing (Html)
import Html.Events exposing (onClick)
import Color exposing (Color, rgb)
import String exposing (toInt)


type alias Model = {
  source: string
  colors: color list
}


--results for palette turn up here
results : Signal.Mailbox (Result (List Color) (List String))
results =
  Signal.mailbox (Err "invalid request")

--signal for request urls. send requests for palette here
paletteUrl : Signal.Mailbox String
paletteUrl = Signal.mailbox ""

--xforms string url to request
port requests : Signal (Task Http.Error (List Color))
port requests =
  Signal.map getColors paletteUrl.signal
    |> Signal.map (\task -> Task.toResult task `andThen` Signal.send results.address)


--if the paletteUrl is valid, get it with the colors decoder
getColors : String -> Task Http.Error (List Color)
getColors paletteUrl =
  let toUrl =
    if String.length paletteUrl > 0
      then succeed paletteUrl
      else fail "invalid url"
  in
    toUrl
    `andThen` (mapError (always "invalid URL") << Http.get colors)

--converts a list of tuple3s into colors
colors : Json.Decoder (List Color)
  let rgb = Json.tuple3 (\r, g, b ->
           rgb (toInt r) (toInt g) (toInt b))
        Json.string Json.string Json.string
  in
    "colors" := Json.list rgb
