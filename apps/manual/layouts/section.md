# {{ .Title }}

{{ .RenderShortcodes }}

{{ range .Pages.ByWeight }}
- [{{ .LinkTitle }}]({{ with .OutputFormats.Get "markdown" }}{{ .Permalink }}{{ end }})
{{ end }}
