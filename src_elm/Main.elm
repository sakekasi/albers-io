module Main where

import ColorSwatch

import StartApp.Simple as StartApp
import Color exposing (Color)

main =  StartApp.start { model = Color.green
                       , view = ColorSwatch.view
                       , update = ColorSwatch.update}
