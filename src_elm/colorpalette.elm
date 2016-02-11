module ColorPalette where

import Html exposing (Html)
import Html.Events exposing (onClick)
import Color exposing (Color)


type alias Model = {
  source: string
  colors: color list
}
