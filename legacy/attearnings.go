package main

import (
	"fmt"
	"io"
	"os"
	"strconv"
	"strings"
)

func CalculateEarnings() (int64, error) {
	params, err := readParameters()
	if err != nil {
		return 0, fmt.Errorf("failed to read parameters: %w", err)
	}
	fmt.Println(params)
	if err := validateParameters(params); err != nil {
		return 0, err
	}
	return calculateEarnings(params)
}

type Params struct {
	NumberOfPlaces int
	NumberOfRides  int
	Group          []int
}

func readParameters() (*Params, error) {
	input, err := io.ReadAll(os.Stdin)
	if err != nil {
		return nil, fmt.Errorf("failed to read the stdin: %w", err)
	}
	lines := strings.Split(string(input), "\n")
	paramsLine := lines[0]
	params := strings.Split(paramsLine, " ")

	if len(params) != 3 {
		return nil, fmt.Errorf("the stdin is malformed: bad parameters: %s", paramsLine)
	}
	p := &Params{}
	numberOfPlaces, err := strconv.ParseInt(params[0], 10, 64)
	if err != nil {
		return nil, fmt.Errorf("failed to parse the number of places param: %w", err)
	}
	p.NumberOfPlaces = int(numberOfPlaces)
	numberOfRides, err := strconv.ParseInt(params[1], 10, 64)
	if err != nil {
		return nil, fmt.Errorf("failed to parse the number of places param: %w", err)
	}
	p.NumberOfRides = int(numberOfRides)
	groups, err := strconv.ParseInt(params[2], 10, 64)
	if len(lines) != int(groups)+1 {
		return nil, fmt.Errorf("the stdin is malformed: bad number of groups: \"%d\"", groups)
	}
	p.Group = make([]int, 0, len(lines[1:]))
	for _, l := range lines[1:] {
		groupCount, err := strconv.ParseInt(l, 10, 64)
		if err != nil {
			return nil, fmt.Errorf("failed to parse line %s: %v", l, err)
		}
		p.Group = append(p.Group, int(groupCount))
	}
	return p, err
}

func calculateEarnings(p *Params) (int64, error) {
	if len(p.Group) == 0 || p.NumberOfRides == 0 || p.NumberOfPlaces == 0 {
		return 0, nil
	}

	var currPeopleCountInRide int
	var result int64
	var currPosInQueue int

	for p.NumberOfRides > 0 {
		if currPosInQueue >= len(p.Group) {
			currPosInQueue = 0
		}
		currGroup := p.Group[currPosInQueue]
		if currPeopleCountInRide+currGroup > p.NumberOfPlaces {
			result += int64(currPeopleCountInRide)
			currPeopleCountInRide = 0
			p.NumberOfRides--
			continue
		}
		currPeopleCountInRide += currGroup
		currPosInQueue++
	}
	return result, nil
}

func validateParameters(p *Params) error {
	if p == nil {
		return fmt.Errorf("passed parameter object is nil")
	}
	if p.NumberOfPlaces < 0 || p.NumberOfRides < 0 {
		return fmt.Errorf("passed parameter object is not valid: %v", p)
	}
	return nil
}
