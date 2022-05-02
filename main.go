package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"os"
)

type FileInfo struct {
	Name     string     `json:"name"`
	Size     string     `json:"size"`
	Length   int64      `json:"length"`
	Children []FileInfo `json:"children"`
}

const infofile = "cccc/info.json"

func main() {

	if os.Mkdir("cccc", 0755) != nil {
		fmt.Print("folder already exists")
		return
	}

	var list []FileInfo
	file("files", &list)
	data, _ := json.Marshal(list)
	ioutil.WriteFile(infofile, data, 0644)
	fmt.Print("created info file")
	fmt.Print(string(data))
}

func file(dir string, list *[]FileInfo) {
	fs, err := ioutil.ReadDir(dir)

	if err != nil {
		return
	}

	for _, e := range fs {
		len := e.Size()
		info := FileInfo{Name: e.Name(), Length: len, Size: size(len)}
		if e.IsDir() {
			info.Children = make([]FileInfo, 0)
			file(dir+"/"+e.Name(), &info.Children)
		}
		*list = append(*list, info)
	}
}

func size(bytes int64) string {

	num := float64(bytes)

	if bytes == 0 {
		return "0"
	}

	unit := "KB"
	num = num / 1024

	if num > 1024 {
		num = num / 1024
		unit = "MB"
	}
	if num > 1024 {
		num = num / 1024
		unit = "GB"
	}
	if num > 1024 {
		unit = "TB"
	}

	return fmt.Sprintf("%.2f%v", num, unit)

}
