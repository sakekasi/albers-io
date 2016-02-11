module ColorSwatch where

import Html exposing (Html, div)
import Html.Events exposing (onClick)
import Html.Attributes exposing (style, class)
import Color exposing (Color, toRgb)
import String exposing (concat)

type alias Model = Color

update: () -> Model -> Model
update _ x = x

view: Signal.Address Model -> Model -> Html
view address model =
  div [ onClick address model
      , class "swatch"
      , style [ ("background-color", toCss model)
              , ("width", "50px")
              , ("height", "50px")]
    ]
    []

toCss: Color -> String
toCss color = let rgb = toRgb color
  in concat ["rgb(", toString rgb.red,
             ","   , toString rgb.green,
             ","   , toString rgb.blue, ")"]
