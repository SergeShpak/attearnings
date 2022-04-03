package main

import (
	"log"
)

func main() {
	earnings, err := CalculateEarnings()
	if err != nil {
		log.Fatal(err)
	}
	log.Printf("earnings: %d", earnings)
}
