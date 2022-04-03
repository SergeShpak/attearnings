package main

import (
	"fmt"
	"testing"
)

func Test_calculateEarnings(t *testing.T) {
	cases := []struct {
		inP         *Params
		expectedSum int64
		expectedErr error
	}{
		{
			inP: &Params{
				NumberOfPlaces: 3,
				NumberOfRides:  3,
				Group:          []int{3, 1, 1, 2},
			},
			expectedSum: 7,
		},
	}

	for i, tc := range cases {
		t.Run(fmt.Sprintf("case #%d", i), func(t *testing.T) {
			actualResult, actualErr := calculateEarnings(tc.inP)
			if actualErr != tc.expectedErr {
				t.Errorf("expected err %v, got %v", tc.expectedErr, actualErr)
				return
			}
			if actualResult != tc.expectedSum {
				t.Errorf("expected result %v, got %v", tc.expectedSum, actualResult)
				return
			}
		})
	}
}
